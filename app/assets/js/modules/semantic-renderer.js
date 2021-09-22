
import DOMPurify from './dompurify.js';

DOMPurify.setConfig({
  ADD_TAGS: [
    'detail-box',
    'tab-panels'
  ],
  ADD_ATTR: [
    'modal-close',
    'semantic-type',
    'semantic-view'
  ]
});

var SemanticRenderer = {
  async render(vc, template = {}, type, options = {}) {
    let view = template.views[type];
    if (!view) throw `NotFoundError: there is no "${type}" template defined for this type of semantic object`;
    let content = view.call(template, vc, options);
    if (type === 'listItem') {
      content = `<li semantic-type="${template.type}" semantic-view="${type}">
        <i class="fa-fw ${ template.icon || '' }"></i>
        <span>${content.body}</span>
      </li>`
    } 
    else if (type === 'card') {
      content = `<article semantic-type="${template.type}" semantic-view="${type}">
        <header>
          <h2>
            <i class="fa-fw ${ template.icon || '' }"></i> ${content.title}
          </h2>
          <div>${ content.subtitle || '' }</div>
          ${ options.modal ? '<span modal-close=""></span>' : '' }
        </header>
        <section>
          ${content.description ? '<p>' + content.description  + '</p>' : ''}
          ${content.body}
        </section>
        <footer>
          ${ options.modal ? '<button modal-close>Close</button>' : '' }
        </footer>
      </article>`;
    }
    content = DOMPurify.sanitize(content);
    if (options.inflate) {
      let node = document.createElement('template');
      node.innerHTML = content;
      content = node.content;
    }
    return content;
  }
}

export { SemanticRenderer }