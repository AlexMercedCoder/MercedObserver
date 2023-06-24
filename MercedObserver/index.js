class MercedObserver {
    static observers = {};
  
    constructor(values, observedby) {
      this.values = { ...values };
      this.observedby = observedby;
      this.subscribers = [];
  
      document.querySelectorAll(`[m-observedby='${observedby}']`).forEach(node => {
        this.subscribe(node);
      });
    }
  
    subscribe(node) {
      const template = node.innerText;
      this.subscribers.push({ node, template });
      this.render({ node, template });
    }
  
    update(newValues) {
      const changedValues = {};
      for (let key in newValues) {
        if (this.values[key] !== newValues[key]) {
          this.values[key] = newValues[key];
          changedValues[key] = true;
        }
      }
      this.subscribers.forEach(subscriber => {
        if (this.templateUsesChangedValues(subscriber.template, changedValues)) {
          this.render(subscriber);
        }
      });
    }
  
    templateUsesChangedValues(template, changedValues) {
      const keys = template.match(/{=\s*([^=]+?)\s*=}/g) || [];
      return keys.some(key => key.trim() in changedValues);
    }
  
    render({ node, template }) {
      let renderedTemplate = template;
      renderedTemplate = this.injectValues(renderedTemplate);
      renderedTemplate = this.evaluateExpressions(renderedTemplate);
      if (node.hasAttribute("m-loop")) {
        const [arrayName, itemName] = node.getAttribute("m-loop").split('|');
        renderedTemplate = this.renderLoop(renderedTemplate, arrayName, itemName);
      }
      node.innerHTML = renderedTemplate;
    }
  
    injectValues(template) {
      return template.replace(/{=\s*(.*?)\s*=}/g, (_, key) => this.values[key.trim()]);
    }
  
    evaluateExpressions(template) {
      return template.replace(/{%\s*(.*?)\s*%}/g, (_, expr) => {
        const func = new Function('values', `with(values) { return ${expr}; }`);
        return func(this.values);
      });
    }
  
    renderLoop(template, arrayName, itemName) {
      return template.replace(/%s/g, _ => {
        return this.values[arrayName].map(item => {
          const tempValues = { ...this.values, [itemName]: item };
          return this.evaluateExpressions(template, tempValues);
        }).join('');
      });
    }
  
    static observe() {
      const nodes = document.querySelectorAll('[m-observedby]');
      nodes.forEach(node => {
        const observedby = node.getAttribute('m-observedby');
        if (!this.observers[observedby]) {
          let initial = {};
          if (node.hasAttribute('m-initial')) {
            initial = JSON.parse(node.getAttribute('m-initial'));
          }
          this.observers[observedby] = new MercedObserver(initial, observedby);
        }
      });
    }
  }