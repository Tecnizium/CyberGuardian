const xlsx = require("xlsx");
const fs = require("fs");

var alerts = [];
var signature = [];
var countries = [];

class Alert {
  constructor(
    id,
    time,
    signature,
    sport,
    dport,
    severity,
    sip_hash,
    dip_hash,
    sip_country,
    dip_country,
    sip_asn,
    dip_asn
  ) {
    this.id = id;
    this.time = time;
    this.signature = signature;
    this.sport = sport;
    this.dport = dport;
    this.severity = severity;
    this.sip_hash = sip_hash;
    this.dip_hash = dip_hash;
    this.sip_country = sip_country;
    this.dip_country = dip_country;
    this.sip_asn = sip_asn;
    this.dip_asn = dip_asn;
  }
}

class Signature {
  constructor(signature, protocol, description) {
    this.signature = signature;
    this.protocol = protocol;
    this.description = description;
  }
}

class Country {
  constructor(country_id, country_code, country_description) {
    this.country_id = country_id;
    this.country_code = country_code;
    this.country_description = country_description;
  }
}

const main = () => {
  const fileName = "./data.xlsx";
  const wb = xlsx.readFile(fileName);
  const alertsxlsx = getAlerts(wb);
  const signaturexlsx = getSignature(wb);
  const countriesxlsx = getCountries(wb);
  const jsonAlerts = JSON.stringify(alertsxlsx);
  const jsonSignature = JSON.stringify(signaturexlsx);
  const jsonCountries = JSON.stringify(countriesxlsx);
  fs.writeFileSync("./alerts.json", jsonAlerts, "utf8");
  fs.writeFileSync("./signature.json", jsonSignature, "utf8");
  fs.writeFileSync("./countries.json", jsonCountries, "utf8");

  alerts = JSON.parse(jsonAlerts).map(
    (alert) =>
      new Alert(
        alert.id,
        alert[" time"],
        alert[" signature"],
        alert[" sport"],
        alert[" dport"],
        alert[" severity"],
        alert[" sip_hash"],
        alert[" dip_hash"],
        alert[" sip_country"],
        alert[" dip_country"],
        alert[" sip_asn"],
        alert[" dip_asn"]
      )
  );
  signature = JSON.parse(jsonSignature).map(
    (sig) => new Signature(sig.signature, sig.protocol, sig.description)
  );
  countries = JSON.parse(jsonCountries).map(
    (country) =>
      new Country(
        country.country_id,
        country.country_code,
        country.country_description
      )
  );

  const report = analyzeData();
  console.log(report);
  const jsonReport = JSON.stringify(report);
  fs.writeFileSync("./report.json", jsonReport, "utf8");
};

const getAlerts = (wb) => {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws);
  return data;
};

const getSignature = (wb) => {
  const ws = wb.Sheets[wb.SheetNames[1]];
  const data = xlsx.utils.sheet_to_json(ws);
  return data;
};

const getCountries = (wb) => {
  const ws = wb.Sheets[wb.SheetNames[2]];
  const data = xlsx.utils.sheet_to_json(ws);
  return data;
};

function getPrevalentAttacks() {
  const attackCounts = {};

  // Contar as ocorrências de cada tipo de ataque
  alerts.forEach((alert) => {
    const attackSignature = alert.signature;
    if (attackCounts[attackSignature]) {
      attackCounts[attackSignature]++;
    } else {
      attackCounts[attackSignature] = 1;
    }
  });

  // Converter o objeto em um array e ordenar por contagem
  const sortedAttacks = Object.keys(attackCounts).map((signature) => {
    return { signature, count: attackCounts[signature] };
  });

  sortedAttacks.sort((a, b) => b.count - a.count);

  // Encontrar a descrição correspondente para cada assinatura
  return sortedAttacks.map((attack) => {
    const signatureDetails = signature.find(
      (sig) => String(sig.signature) === attack.signature
    );
    attack.description = signatureDetails
      ? signatureDetails.description
      : "Unknown";
    return attack;
  });
}

function getSeverityPercentages() {
  const severityCounts = {
    critical: 0,
    major: 0,
    minor: 0,
    low: 0,
  };

  alerts.forEach((alert) => {
    switch (alert.severity) {
      case 1:
        severityCounts.critical++;
        break;
      case 2:
        severityCounts.major++;
        break;
      case 3:
        severityCounts.minor++;
        break;
      case 4:
        severityCounts.low++;
        break;
      // Adicione mais casos aqui se houver outras categorias de severidade
    }
  });

  const totalAttacks = alerts.length;
  const percentages = {};

  for (const severity in severityCounts) {
    percentages[severity] = (severityCounts[severity] / totalAttacks) * 100;
  }

  return percentages;
}

function getPrevalentProtocols() {
  const protocolCounts = {};

  // Contar as ocorrências de cada protocolo
  alerts.forEach((alert) => {
    const signatureDetail = signature.find(
      (sig) => sig.signature === alert.signature
    );
    const protocol = signatureDetail ? signatureDetail.protocol : "Unknown";

    if (protocolCounts[protocol]) {
      protocolCounts[protocol]++;
    } else {
      protocolCounts[protocol] = 1;
    }
  });

  // Converter o objeto em um array e ordenar por contagem
  const sortedProtocols = Object.entries(protocolCounts).map(
    ([protocol, count]) => {
      return { protocol, count };
    }
  );

  sortedProtocols.sort((a, b) => b.count - a.count);

  return sortedProtocols;
}

function getInternalExternalAttacks() {
  let internalCount = 0;
  let externalCount = 0;

  alerts.forEach((alert) => {
    if (alert.sip_asn === 1) {
      internalCount++;
    } else {
      externalCount++;
    }
  });

  return {
    internal: internalCount,
    external: externalCount,
  };
}

function getAttackingCountriesRank() {
  const countryAttackCounts = {};

  // Contagem dos ataques por país
  alerts.forEach((alert) => {
    const countryId = alert.sip_country;
    if (countryAttackCounts[countryId]) {
      countryAttackCounts[countryId]++;
    } else {
      countryAttackCounts[countryId] = 1;
    }
  });

  // Converter o objeto em um array e ordenar por contagem
  const sortedCountries = Object.entries(countryAttackCounts).map(
    ([countryId, count]) => {
      // Encontrar o nome do país usando o ID
      const country = countries.find((c) => String(c.country_id) === countryId);
      const countryName = country ? country.country_description : "Unknown";
      return { country: countryName, count };
    }
  );

  // Ordenar países por número de ataques
  sortedCountries.sort((a, b) => b.count - a.count);

  return sortedCountries;
}

function getLeastAttacker() {
  const attackerCounts = {};

  // Contar as ocorrências de cada atacante
  alerts.forEach((alert) => {
    const attackerHash = alert.sip_hash;
    if (attackerCounts[attackerHash]) {
      attackerCounts[attackerHash]++;
    } else {
      attackerCounts[attackerHash] = 1;
    }
  });

  // Encontrar o atacante com o menor número de ataques
  let leastAttackerHash = null;
  let leastAttackCount = Infinity;

  for (const [hash, count] of Object.entries(attackerCounts)) {
    if (count < leastAttackCount) {
      leastAttackCount = count;
      leastAttackerHash = hash;
    }
  }

  // Calcular o percentual do total de ataques
  const totalAttacks = alerts.length;
  const percentage = (leastAttackCount / totalAttacks) * 100;

  return {
    leastAttackerHash,
    leastAttackCount,
    percentage: percentage.toFixed(2), // Formatação para duas casas decimais
  };
}

function getPrevalentVictims() {
  const victimCounts = {};

  // Contar as ocorrências de cada vítima
  alerts.forEach((alert) => {
    const victimHash = alert.dip_hash;
    if (victimCounts[victimHash]) {
      victimCounts[victimHash]++;
    } else {
      victimCounts[victimHash] = 1;
    }
  });

  // Converter o objeto em um array e ordenar por contagem
  const sortedVictims = Object.entries(victimCounts).map(([hash, count]) => {
    return { victimHash: hash, count };
  });

  sortedVictims.sort((a, b) => b.count - a.count);

  return sortedVictims;
}

const analyzeData = () => {
  // Quantas tentativas de ataques foram detectadas pelo IDS no dia?
  const totalAttacks = alerts.length;

  // Quais foram os ataques mais prevalentes?
  const prevalentAttacks = getPrevalentAttacks();

  // Quantos atacantes diferentes apareceram nos registros?
  const uniqueAttackers = new Set(alerts.map((alert) => alert.sip_hash)).size;

  // Qual foi o percentual de ataques considerados críticos? E de menor grau de severidade?
  const severityPercentages = getSeverityPercentages();

  // Quais os protocolos mais prevalentes nos ataques?
  const prevalentProtocols = getPrevalentProtocols();

  // Quantos ataques internos e externos?
  const { internal, external } = getInternalExternalAttacks();

  // Qual o ranking dos países que mais atacaram?
  const attackingCountriesRank = getAttackingCountriesRank();

  // Qual a identidade do atacante que menos atacou? Quantas vezes ele atacou e qual o percentual sobre o total de ataques?
  const leastAttacker = getLeastAttacker();

  // Qual o ranking das vítimas mais prevalentes?
  const prevalentVictims = getPrevalentVictims();

  return {
    totalAttacks,
    prevalentAttacks,
    uniqueAttackers,
    severityPercentages,
    prevalentProtocols,
    internalExternal: { internal, external },
    attackingCountriesRank,
    leastAttacker,
    prevalentVictims,
  };
};

main();
