class TemplateObservable {
    constructor() {
      this.subscribers = [];
      this.values = {};
    }

    subscribe(node, template) {
      this.subscribers.push({ node: node, template: template });
    }

    update(values) {
      let updateQueue = new Set();
      for (let key in values) {
        if (this.values[key] !== values[key]) {
          this.values[key] = values[key];
          this.subscribers.forEach((subscriber) => {
            if (
              this.isInExpression(subscriber.template, key) ||
              this.isInLoop(subscriber.template, key)
            ) {
              updateQueue.add(subscriber.node);
            }
          });
        }
      }
      this.notify(updateQueue);
    }

    notify(updateQueue) {
      updateQueue.forEach((node) => {
        let subscriber = this.subscribers.find(
          (subscriber) => subscriber.node === node
        );
        this.render(subscriber);
      });
    }

    isInExpression(template, key) {
      const regex = new RegExp(`{=\\s*[^=]*?\\b${key}\\b.*?=}`, "g");
      return regex.test(template);
    }

    isInLoop(template, key) {
      return template.includes("{* " + key + "->");
    }

    render(subscriber) {
      let content = subscriber.template;
      content = this.renderLoop(content);
      content = this.injectValue(content);
      subscriber.node.innerHTML = content;
    }

    injectValue(content) {
      return content.replace(/{=\s*(.*?)\s*=}/g, (_, key) => {
        return this.values[key.trim()];
      });
    }

    renderLoop(content) {
      return content.replace(
        /{\*\s*(.*?)\s*->\s*(.*?)\s*\|\s*(.*?)\s*\*}/g,
        (_, arrayName, itemName, itemTemplate) => {
          let output = "";
          for (let item of this.values[arrayName]) {
            console.log(item)
            let itemFunc = this.safeEvalFunction(itemName, itemTemplate);
            output += itemFunc(item);
          }
          console.log(output)
          return output;
        }
      );
    }

    safeEvalFunction() {
      let keys = Array.prototype.slice.call(arguments, 0, -1);
      let expr = arguments[arguments.length - 1];
      let func = new Function(
        ...keys,
        `try { return ${expr}; } catch (e) { return ""; }`
      );
      console.log(func)
      return func;
    }
  }