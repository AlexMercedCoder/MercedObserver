# TemplateObservable Class
The Observable class allows you to create an object that can notify a list of subscribers when a value has been updated. Subscribers are typically DOM nodes that you want to update based on changes in values.

## Constructor
```javascript
const observable = new TemplateObservable();
The constructor takes no parameters and initializes an empty list of subscribers and an empty values object.
```

## Methods

### subscribe(node, template)
This method allows you to add a new subscriber to the observable. A subscriber consists of a DOM node and a template string that uses special syntax to reference values that the node should display.
```javascript
observable.subscribe(document.querySelector('.myClass'), 'Hello, {= name =}.');
```

### update(values)

This method takes an object of new values and updates the observable's values with these. It then checks each subscriber to see if it needs to be updated based on these new values and adds any that do to an update queue. After checking all subscribers, it notifies all subscribers in the update queue.

```javascript
observable.update({name: 'John', age: 30});
```

### notify(updateQueue)
This method is called by the update method. It takes the update queue as a parameter and updates each subscriber in the queue.

### isInExpression(template, key)
This is a helper method used by the update method to check if a subscriber's template includes the updated key in an expression.

### isInLoop(template, key)
This is a helper method used by the update method to check if a subscriber's template includes the updated key in a loop.

### render(subscriber)
This method takes a subscriber and updates its DOM node's innerHTML based on its template and the observable's values.

### injectValue(content)
This is a helper method used by the render method to replace expressions in the form {= key =} in a string with the corresponding value from the observable's values.

### renderLoop(content)
This is a helper method used by the render method to replace loops in the form {* array->item | <template> *} in a string with the corresponding HTML.

### safeEvalFunction()
This is a helper method used by the renderLoop method to safely evaluate JavaScript code contained in a string.

### Template Syntax

- `{= value =}` inject a value the observable tracks into the template

To Loop over a value
```
{* items->item | `<li>${item}</li>` *}
```

Examples
```js
// Create a new observable
const observable = new Observable();

// Subscribe a DOM node to the observable with a template
observable.subscribe(document.querySelector('.myClass'), 'Hello, {= name =}.');

// Update the observable's values
observable.update({name: 'John'});

// This will cause the innerHTML of the DOM node with class 'myClass' to be updated to 'Hello, John.'.
```