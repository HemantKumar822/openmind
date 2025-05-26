export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      return false;
    }
  }
}

export function getLanguageName(lang: string): string {
  const languageMap: Record<string, string> = {
    js: 'JavaScript',
    jsx: 'JSX',
    ts: 'TypeScript',
    tsx: 'TSX',
    py: 'Python',
    rb: 'Ruby',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    go: 'Go',
    php: 'PHP',
    swift: 'Swift',
    kt: 'Kotlin',
    rs: 'Rust',
    sh: 'Shell',
    bash: 'Bash',
    zsh: 'Zsh',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    xml: 'XML',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    less: 'Less',
    sql: 'SQL',
    graphql: 'GraphQL',
    md: 'Markdown',
    mdx: 'MDX',
    dockerfile: 'Dockerfile',
    gitignore: 'Git Ignore',
    env: 'Environment',
  };

  return languageMap[lang.toLowerCase()] || lang;
}
