const fs = require('fs');

let content = fs.readFileSync('data.js', 'utf8');

const quizReplacements = {
    'rule: "Essere vs Venire"': 'rule: "Essere vs Venire", ex: "Io sono di Roma, io vengo da Milano."',
    'rule: "Reflexive Pronouns"': 'rule: "Reflexive Pronouns", ex: "Io mi chiamo, Tu ti chiami."',
    'rule: "Definite Articles"': 'rule: "Definite Articles", ex: "Il gatto, Lo zaino, La casa."',
    'rule: "Noi form (We)"': 'rule: "Noi form (We)", ex: "Io e lei = Noi (We). Noi mangiamo una pizza."',
    'rule: "Avere sonno (To be sleepy)"': 'rule: "Avere sonno (To be sleepy)", ex: "Ho sonno, vado a letto."',
    'rule: "Articles with Piacere"': 'rule: "Articles with Piacere", ex: "Mi piace la pasta. Mi piacciono i cani."',
    'rule: "Sapere vs Conoscere"': 'rule: "Sapere vs Conoscere", ex: "So suonare il piano. Conosco Marco."',
    'rule: "Prepositions of Purpose"': 'rule: "Prepositions of Purpose", ex: "Studio per imparare. Corro per dimagrire."',
    'rule: "Adjective Agreement"': 'rule: "Adjective Agreement", ex: "Il libro rosso, la sedia rossa."',
    'rule: "Age in Italian"': 'rule: "Age in Italian", ex: "Ho vent\'anni."',

    'rule: "Imperfetto vs Passato Prossimo"': 'rule: "Imperfetto vs Passato Prossimo", ex: "Leggevo quando è andata via la luce."',
    'rule: "Indirect Pronouns"': 'rule: "Indirect Pronouns", ex: "Le parlo (I speak to her). Gli parlo (I speak to him)."',
    'rule: "Il Congiuntivo (Subjunctive)"': 'rule: "Il Congiuntivo (Subjunctive)", ex: "Penso che sia vero. Spero che tu venga."',
    'rule: "Passato Prossimo with Essere"': 'rule: "Passato Prossimo with Essere", ex: "Sono andato al supermercato. È partita."',
    'rule: "Direct Object Pronouns"': 'rule: "Direct Object Pronouns", ex: "La mangio (I eat it). Li compro (I buy them)."',
    'rule: "Periodo Ipotetico (Type 1)"': 'rule: "Periodo Ipotetico (Type 1)", ex: "Se studio, passo l\'esame. Se mangio troppo, starò male."',
    'rule: "Relative Pronouns"': 'rule: "Relative Pronouns", ex: "Il libro che leggo. La ragazza che parla."',
    'rule: "Double Negatives"': 'rule: "Double Negatives", ex: "Non vedo niente. Non c\'è nessuno."',
    'rule: "Verbs with Prepositions"': 'rule: "Verbs with Prepositions", ex: "Ho deciso di uscire. Ho dimenticato di chiamare."',
    'rule: "Dove vs In cui"': 'rule: "Dove vs In cui", ex: "La città in cui vivo. La scuola dove studio."',

    'rule: "Periodo Ipotetico (Type 3)"': 'rule: "Periodo Ipotetico (Type 3)", ex: "Se avessi saputo, sarei andato."',
    'rule: "Congiuntivo with Concessive clauses"': 'rule: "Congiuntivo with Concessive clauses", ex: "Nonostante piova, esco. Benché fosse stanco, lavorò."',
    'rule: "Advanced Idioms"': 'rule: "Advanced Idioms", ex: "A dirla tutta, non mi piace per niente."',
    'rule: "Passive Voice"': 'rule: "Passive Voice", ex: "La mela è mangiata da me. L\'edificio è stato costruito."',
    'rule: "Verbi Pronominali (Andarsene)"': 'rule: "Verbi Pronominali (Andarsene)", ex: "Io me ne vado. Lui se ne andò."',
    'rule: "Trapassato Remoto"': 'rule: "Trapassato Remoto", ex: "Appena ebbe finito di parlare, se ne andò."',
    'rule: "Volerci vs Metterci"': 'rule: "Volerci vs Metterci", ex: "Ci vuole un\'ora. Ci metto un\'ora."',
    'rule: "Congiuntivo Trapassato"': 'rule: "Congiuntivo Trapassato", ex: "Credevo che fosse già partito."',
    'rule: "Congiuntivo with Emotions"': 'rule: "Congiuntivo with Emotions", ex: "Sono felice che tu stia bene. Temo che piova."',
    'rule: "Participle Agreement with \'Ne\'"': 'rule: "Participle Agreement with \'Ne\'", ex: "Ho mangiato due mele -> Ne ho mangiate due."',

    'rule: "Plurali Sovrabbondanti"': 'rule: "Plurali Sovrabbondanti", ex: "Il braccio -> Le braccia. Il lenzuolo -> Le lenzuola."',
    'rule: "Idioms (Tagliare la corda)"': 'rule: "Idioms (Tagliare la corda)", ex: "La polizia sta arrivando, tagliamo la corda!"',
    'rule: "Historical Idioms"': 'rule: "Historical Idioms", ex: "Entrare gratis a uno spettacolo = Fare il portoghese."',
    'rule: "Passato Remoto Irregolare"': 'rule: "Passato Remoto Irregolare", ex: "Io nacqui, lui nacque, loro nacquero."',
    'rule: "Idioms (Sale in zucca)"': 'rule: "Idioms (Sale in zucca)", ex: "Ascolta lui, ha molto sale in zucca."',
    'rule: "Irregular Feminine Plurals"': 'rule: "Irregular Feminine Plurals", ex: "L\'uovo -> Le uova. Il lenzuolo -> Le lenzuola."',
    'rule: "Proverbs"': 'rule: "Proverbs", ex: "Hai sbagliato, ma è inutile piangere sul latte versato."',
    'rule: "Collocations"': 'rule: "Collocations", ex: "Dobbiamo correre ai ripari."',
    'rule: "Plurali Sovrabbondanti (Muro)"': 'rule: "Plurali Sovrabbondanti (Muro)", ex: "I muri (esterno), Le mura (città o casa)."',
    'rule: "Idioms (Gioco da ragazzi)"': 'rule: "Idioms (Gioco da ragazzi)", ex: "Questo test è un gioco da ragazzi."'
};

for (const [k, v] of Object.entries(quizReplacements)) {
    content = content.replace(k, v);
}

// ensure rule has example mapped
content = content.replace(/rule: item\.rule \|\| '', danielNotes: item\.dan/g, "rule: item.rule || '', example: item.ex || '', danielNotes: item.dan");

fs.writeFileSync('data.js', content, 'utf8');
console.log('data.js patched with examples!');
