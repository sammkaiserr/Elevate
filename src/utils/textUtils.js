export const getCleanPreviewText = (htmlString, maxLength = 200) => {
  if (!htmlString) return '';
  try {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    let text = div.textContent || div.innerText || '';
    text = text
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  } catch (err) {
    return htmlString.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').substring(0, maxLength);
  }
};
