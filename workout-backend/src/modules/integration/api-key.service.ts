import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createHash, randomBytes } from "crypto";
import { ApiKeyEntity } from "../../entities/api-key.entity";

const DEFAULT_SCOPES = ["notes:write", "tasks:write"];

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
  ) {}

  private hashKey(raw: string): string {
    return createHash("sha256").update(raw).digest("hex");
  }

  hasScopes(current: string[], required: string[]): boolean {
    return required.every(scope => current.includes(scope));
  }

  async createKey(
    userUUID: string,
    name = "Integration key",
    scopes: string[] = DEFAULT_SCOPES,
  ): Promise<{ apiKey: ApiKeyEntity; token: string }> {
    const prefix = `ztg_${randomBytes(3).toString("hex")}`;
    const token = `${prefix}_${randomBytes(24).toString("hex")}`;
    const keyHash = this.hashKey(token);

    const apiKey = this.apiKeyRepository.create({
      userUUID,
      prefix,
      keyHash,
      name,
      scopes,
    });

    const saved = await this.apiKeyRepository.save(apiKey);
    return { apiKey: saved, token };
  }

  async listKeys(userUUID: string): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepository.find({
      where: { userUUID },
      order: { createdAt: "DESC" },
    });
  }

  async revokeKey(userUUID: string, id: number): Promise<ApiKeyEntity> {
    const key = await this.apiKeyRepository.findOne({
      where: { id, userUUID },
    });
    if (!key) {
      return null;
    }
    key.revokedAt = new Date();
    return this.apiKeyRepository.save(key);
  }

  async validateKey(raw: string): Promise<ApiKeyEntity | null> {
    const keyHash = this.hashKey(raw);
    const found = await this.apiKeyRepository.findOne({
      where: { keyHash, revokedAt: null },
    });
    if (!found) {
      return null;
    }
    found.lastUsedAt = new Date();
    await this.apiKeyRepository.save(found);
    return found;
  }
}
