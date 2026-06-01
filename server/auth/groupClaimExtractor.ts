export interface GroupRoleMapping {
  groupName: string;
  userRoleId: number;
}

export interface GroupClaimExtractorOptions {
  mode: "scope" | "claim";
  claimPath: string;
  groupRoleMappings: GroupRoleMapping[];
}

export class GroupClaimExtractor {
  static parseGroupMappings(raw: string, delimiter = ","): GroupRoleMapping[] {
    return (raw || "")
      .split(delimiter)
      .filter(Boolean)
      .map((entry) => {
        const lastColon = entry.lastIndexOf(":");
        return {
          groupName: entry.slice(0, lastColon).trim(),
          userRoleId: Number.parseInt(entry.slice(lastColon + 1).trim(), 10),
        };
      });
  }

  private readonly mode: "scope" | "claim";
  private readonly claimPath: string;
  private readonly groupRoleMappings: GroupRoleMapping[];

  constructor(options: GroupClaimExtractorOptions) {
    this.mode = options.mode;
    this.claimPath = options.claimPath || "";
    this.groupRoleMappings = options.groupRoleMappings || [];
  }

  extractGroups(tokenClaims: Record<string, any>): string[] {
    if (this.mode === "scope") {
      return this.extractFromScope(tokenClaims.scope ?? "");
    }
    return this.extractFromClaim(tokenClaims);
  }

  buildScopeAdditions(): string[] {
    if (this.mode !== "scope") return [];
    return this.groupRoleMappings.map((m) => `group:${m.groupName.toLowerCase()}`);
  }

  getAllMatchingRoles(groups: string[]): number[] {
    const roleIds = new Set<number>();
    logger.debug({
      service: "auth",
      message: `OIDC groups extracted: ${JSON.stringify(groups)}`,
    });
    for (const group of groups) {
      for (const mapping of this.groupRoleMappings) {
        if (group === mapping.groupName.toLowerCase()) {
          roleIds.add(mapping.userRoleId);
        }
      }
    }
    return Array.from(roleIds);
  }

  private extractFromScope(scopeString: string): string[] {
    return scopeString
      .split(" ")
      .filter((scope) =>
        this.groupRoleMappings.some(
          (m) => scope.toLowerCase() === `group:${m.groupName.toLowerCase()}`,
        ),
      )
      .map((scope) => scope.slice("group:".length).toLowerCase());
  }

  private extractFromClaim(claims: Record<string, any>): string[] {
    const value = resolveDotPath(claims, this.claimPath);
    if (!Array.isArray(value)) return [];
    return value
      .filter((v) => typeof v === "string")
      .map((v) => v.replace(/^\//, "").toLowerCase());
  }
}

function resolveDotPath(obj: Record<string, any>, path: string): any {
  if (!path) return undefined;
  return path.split(".").reduce((cur, key) => (cur != null ? cur[key] : undefined), obj);
}
