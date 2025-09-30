export interface GroupRoleMapping {
  groupName: string;
  userRoleId: number;
}

export interface GroupScopeProcessorOptions {
  groupRoleMappings: GroupRoleMapping[];
  useStandardGroupsClaim?: boolean;
}

export class GroupScopeProcessor {
  private groupRoleMappings: GroupRoleMapping[];

  constructor(options: GroupScopeProcessorOptions) {
    this.groupRoleMappings = options.groupRoleMappings || [];
  }

  extractGroups(scopeString: string): string[] {
    const scopes = scopeString.split(" ");
    return scopes.filter((scope) =>
      this.groupRoleMappings.some(
        (mapping) => scope.toLowerCase() === `group:${mapping.groupName.toLowerCase()}`,
      ),
    );
  }

  getUserRoleId(groups: string[]): number | null {
    for (const group of groups) {
      const normalized = group.toLowerCase().replace(/^group:/, "");

      const match = this.groupRoleMappings.find(
        (mapping) => normalized === mapping.groupName.toLowerCase(),
      );

      if (match) return match.userRoleId;
    }

    return null;
  }

  getAllMatchingRoles(groups: string[]): number[] {
    const roleIds = new Set<number>();
    logger.debug({
      service: "auth",
      message: `OIDC Roles String returned: \n${JSON.stringify(groups, null, 2)}`,
    });
    for (const group of groups) {
      const normalized = group.toLowerCase().replace(/^group:/, "");

      for (const mapping of this.groupRoleMappings) {
        if (normalized === mapping.groupName.toLowerCase()) {
          roleIds.add(mapping.userRoleId);
        }
      }
    }

    return Array.from(roleIds);
  }
}
