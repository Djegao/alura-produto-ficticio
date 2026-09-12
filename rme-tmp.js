const fs=require('fs');const p='slides/README.md';let s=fs.readFileSync(p,'utf8');
const velho='5 decks `.pptx` das 5 aulas, gerados a partir dos outlines slide-a-slide dos\nroteiros em `docs/`.';
const novo=`5 decks \`.pptx\` das 5 aulas, gerados a partir da **especificação de slides**
no fim de [\`../docs/SCRIPT-LINEAR-CURSO.md\`](../docs/SCRIPT-LINEAR-CURSO.md).

> **Estado em 12/09:** os cinco decks estão gerados e atualizados para o
> formato de gravação linear. O da **Aula 4 foi refeito por completo** (26
> slides) porque aquele capítulo deixou de ter deploys ao vivo e passou a ser
> contado com a evidência preservada. A **Aula 3** ganhou dois slides novos:
> a retenção do Langfuse e a mudança de comportamento do modelo entre 22 e
> 29/08.
>
> Para regerar (idempotente, sobrescreve os cinco):
>
> \`\`\`bash
> node slides/generate-slides-curso.js
> \`\`\``;
if(!s.includes(velho)) { console.log('marcador nao encontrado'); process.exit(1); }
s=s.replace(velho,novo);
fs.writeFileSync(p,s);console.log('README atualizado');
