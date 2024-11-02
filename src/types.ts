export interface NetworkRule {
  ruleType: string;
  name: string;
  ipProtocols: string[];
  sourceAddresses: string[];
  sourceIpGroups: string[];
  destinationAddresses: string[];
  destinationIpGroups: string[];
  destinationFqdns: string[];
  destinationPorts: string[];
}

export interface RuleCollection {
  ruleCollectionType: string;
  name: string;
  priority: number;
  action: {
    type: string;
  };
  rules: NetworkRule[];
}

export interface RuleCollectionGroup {
  type: string;
  apiVersion: string;
  name: string;
  location: string;
  dependsOn: string[];
  properties: {
    priority: number;
    ruleCollections: RuleCollection[];
  };
}

export interface FirewallPolicy {
  type: string;
  apiVersion: string;
  name: string;
  location: string;
  properties: {
    sku: {
      tier: string;
    };
    threatIntelMode: string;
    threatIntelWhitelist: {
      fqdns: string[];
      ipAddresses: string[];
    };
  };
}

export interface ArmTemplate {
  $schema: string;
  contentVersion: string;
  parameters: {
    firewallPoliciesName: {
      defaultValue: string;
      type: string;
    };
  };
  variables: Record<string, never>;
  resources: (FirewallPolicy | RuleCollectionGroup)[];
}