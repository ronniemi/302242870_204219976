'use string';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// A class that simplifies populating values on an object from the VSCode command palette.
// Provides a wrapper around the necessary options to display, a callback to see if update
// is needed, and the setter to be called on the object
class PropertyUpdater {
    constructor(inputBoxOptions, quickPickOptions, propertyChecker, propertySetter) {
        this.inputBoxOptions = inputBoxOptions;
        this.quickPickOptions = quickPickOptions;
        this.propertyChecker = propertyChecker;
        this.propertySetter = propertySetter;
    }
    static CreateQuickPickUpdater(quickPickOptions, propertyChecker, propertySetter) {
        return new PropertyUpdater(undefined, quickPickOptions, propertyChecker, propertySetter);
    }
    static CreateInputBoxUpdater(inputBoxOptions, propertyChecker, propertySetter) {
        return new PropertyUpdater(inputBoxOptions, undefined, propertyChecker, propertySetter);
    }
    isQuickPickUpdater() {
        if (this.quickPickOptions) {
            return true;
        }
        return false;
    }
    isUpdateRequired(parentObject) {
        return this.propertyChecker(parentObject);
    }
    updatePropery(parentObject, propertyValue) {
        this.propertySetter(parentObject, propertyValue);
    }
}
exports.PropertyUpdater = PropertyUpdater;

//# sourceMappingURL=propertyUpdater.js.map
