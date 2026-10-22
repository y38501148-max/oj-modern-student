export function parseSubmissionSource(text, expectedId) {
  const header=text.match(/^\/\*[ \t]*\r?\n Author: ([^\r\n]+)\r?\n Result: (\S+)[ \t]+Submission_id: (\d+)\r?\n Created at: ([^\r\n]+)\r?\n Problem(?:_id)?: (\d+)[ \t]+Time: (\S+)[ \t]+Memory: (\S+)\r?\n\*\//);
  if(!header || header[3]!==String(expectedId))return null;
  const prefix=header[0].length+(text.slice(header[0].length).match(/^\r?\n\r?\n/)?.[0].length || 0);
  return {id:header[3],author:header[1],result:header[2],createdAt:header[4],problemId:header[5],time:header[6],memory:header[7],code:text.slice(prefix),prefix};
}

export function trimSourceHeader(code, length) {
  const document=code.ownerDocument;
  const walker=document.createTreeWalker(code,4);
  let remaining=length,node;
  while((node=walker.nextNode())) {
    if(remaining>node.textContent.length) {remaining-=node.textContent.length;continue;}
    const range=document.createRange();range.setStart(code,0);range.setEnd(node,remaining);range.deleteContents();return;
  }
}
