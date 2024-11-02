import { NetworkRule, RuleCollection, RuleCollectionGroup, FirewallPolicy, ArmTemplate } from './types';

export const parseRules = (inputString: string): ArmTemplate => {
  const lines = inputString.split('\n').filter(line => line.trim());
  const sectionMap = new Map<string, { allow: NetworkRule[], deny: NetworkRule[] }>();

  lines.forEach(line => {
    const fields = line.split('\t');
    if (fields.length < 17) return;

    const section = fields[0];
    const ruleNumber = fields[1];
    const action = fields[2].toLowerCase();
    const sourceAddresses = fields[3].split(', ');
    const destinationAddresses = fields[4].split(', ').map(addr => addr === '0.0.0.0/0' ? '*' : addr);
    const serviceType = fields[6].toUpperCase();
    const ports = serviceType === 'ANY' ? ['*'] : (fields[7] === 'ANY' ? ['*'] : fields[7].split(', '));
    const protocols = serviceType === 'ANY' ? ['ANY'] : serviceType.split(', ').map(p => p.toUpperCase());

    const networkRule: NetworkRule = {
      ruleType: "NetworkRule",
      name: `Rule-${ruleNumber}`,
      ipProtocols: protocols,
      sourceAddresses,
      sourceIpGroups: [],
      destinationAddresses,
      destinationIpGroups: [],
      destinationFqdns: [],
      destinationPorts: ports,
    };

    if (!sectionMap.has(section)) {
      sectionMap.set(section, { allow: [], deny: [] });
    }
    
    const sectionRules = sectionMap.get(section)!;
    if (action === 'accept') {
      sectionRules.allow.push(networkRule);
    } else if (action === 'drop' || action === 'reject') {
      sectionRules.deny.push(networkRule);
    }
  });

  const basePolicy: FirewallPolicy = {
    type: "Microsoft.Network/firewallPolicies",
    apiVersion: "2024-01-01",
    name: "[parameters('firewallPoliciesName')]",
    location: "italynorth",
    properties: {
      sku: {
        tier: "Standard"
      },
      threatIntelMode: "Alert",
      threatIntelWhitelist: {
        fqdns: [],
        ipAddresses: []
      }
    }
  };

  const ruleGroups: RuleCollectionGroup[] = Array.from(sectionMap.entries()).map(([section, rules], index) => {
    const ruleCollections: RuleCollection[] = [];

    if (rules.allow.length > 0) {
      ruleCollections.push({
        ruleCollectionType: "FirewallPolicyFilterRuleCollection",
        name: "ALLOW",
        priority: 1000 + parseInt(rules.allow[0].name.replace('Rule-', '')),
        action: {
          type: "Allow"
        },
        rules: rules.allow
      });
    }

    if (rules.deny.length > 0) {
      ruleCollections.push({
        ruleCollectionType: "FirewallPolicyFilterRuleCollection",
        name: "DENY",
        priority: 1000 + parseInt(rules.deny[0].name.replace('Rule-', '')),
        action: {
          type: "Deny"
        },
        rules: rules.deny
      });
    }

    return {
      type: "Microsoft.Network/firewallPolicies/ruleCollectionGroups",
      apiVersion: "2024-01-01",
      name: `[concat(parameters('firewallPoliciesName'), '/${section.replace(/ /g, '_')}')]`,
      location: "italynorth",
      dependsOn: [
        "[resourceId('Microsoft.Network/firewallPolicies', parameters('firewallPoliciesName'))]"
      ],
      properties: {
        priority: 100 + (index * 100),
        ruleCollections: ruleCollections
      }
    };
  });

  return {
    $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    contentVersion: "1.0.0.0",
    parameters: {
      firewallPoliciesName: {
        defaultValue: "AVS-172.21.113.0",
        type: "String"
      }
    },
    variables: {},
    resources: [basePolicy, ...ruleGroups]
  };
};