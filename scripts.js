import { 
     TABLES, 
    COLUMNS, 
    state,
    createOrderData, 
    updateDragging
    } from './data.js';

  console.log(state, TABLES, COLUMNS, createOrderData, updateDragging,)

import{
    createOrderHtml, 
    html, 
    updateDraggingHtml, 
    moveToColumn
    } from './view.js'

   console.log(createOrderHtml, html, updateDraggingHtml, moveToColumn)

   html.other.add.focus();
/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || event.composedPath();
    let column = null;

    for (const element of path) {
        const { area } = element.dataset;
        if (area) {
            column = area;
            break;
        }
    }

    if (!column) return;
    updateDragging({ over: column });
    updateDraggingHtml({ over: column });
};
    
    const handleDragStart = (event) => {
    event.preventDefault();
    
    const orderId = event.target.dataset.id;
    updateDragging({ source: orderId });

   for (const htmlColumn of Object.values(html.columns)) {
        htmlColumn.addEventListener('dragstart', handleDragStart);
        htmlColumn.addEventListener('dragend', handleDragEnd);
    };
}
const handleDragEnd = (event) => {
    event.preventDefault();
    const draggedElement = event.target;
    const dropTarget = event.currentTarget;

    const list = dropTarget.querySelector('ul');
    list.appendChild(draggedElement);

}

const handleHelpToggle = (event) => {
    event.preventDefault();
    const helpOverlay = html.help.overlay;
    helpOverlay.setAttribute('open', 'true');
    helpOverlay.querySelector('button[data-help-cancel]').addEventListener('click', () => {
        helpOverlay.removeAttribute('open');
        html.other.add.focus(); // Return focus to the "Add Order" button
    });
};
const handleAddToggle = (event) => {
    event.preventDefault();
    const addOverlay = html.add.overlay;
    const addForm = html.add.form;
    addForm.reset(); // Clear any previous input values
    addOverlay.setAttribute('open', 'true');
    addForm.querySelector('button[data-add-cancel]').addEventListener('click', () => {
        addOverlay.removeAttribute('open');
        html.other.add.focus(); // Return focus to the "Add Order" button
    });
};
const handleAddSubmit = (event) => {
    event.preventDefault();
    const addForm = event.target;
    const title = addForm.querySelector('[data-add-title]').value;
    const table = addForm.querySelector('[data-add-table]').value;
    if (title && table) {
        // Create a new order and add it to the "Ordered" column
        const newOrder = createOrderData({ title, table, column: 'ordered' });
        state.orders[newOrder.id] = newOrder;
        const orderedColumn = html.columns.ordered;
        orderedColumn.appendChild(createOrderHtml(newOrder));
        addForm.reset();
        html.add.overlay.removeAttribute('open');
        html.other.add.focus(); // Return focus to the "Add Order" button
    }
};
const handleEditToggle = (event) => {
    event.preventDefault();
    const orderId = event.target.closest('.order').dataset.id;
    console.log("orderId:", orderId); // Add this line for debugging
    if (orderId) {
        const editOverlay = html.edit.overlay;
        const editForm = html.edit.form;
        const order = state.orders[orderId];
        editForm.reset();
        editForm.querySelector('[data-edit-title]').value = order.title;
        editForm.querySelector('[data-edit-table]').value = order.table;
        editForm.querySelector('[data-edit-id]').value = orderId;
        editForm.querySelector('[data-edit-column]').value = order.column;
        editOverlay.setAttribute('open', 'true');
        editForm.querySelector('button[data-edit-delete]').addEventListener('click', () => {
            // Handle order deletion
            delete state.orders[orderId];
            const orderElement = document.querySelector(`[data-id="${orderId}"]`);
            if (orderElement) {
                orderElement.remove();
            }
            editOverlay.removeAttribute('open');
            html.other.add.focus(); // Return focus to the "Add Order" button
        });
        editForm.querySelector('button[data-edit-cancel]').addEventListener('click', () => {
            console.log("Cancel button clicked"); // Add this line for debugging
            editOverlay.removeAttribute('open');
            html.other.add.focus(); // Return focus to the "Add Order" button
            html.add.cancel.addEventListener('click', handleAddToggle);
            console.log(html.add.cancel)
        });
    }
};
const handleEditSubmit = (event) => {
    event.preventDefault();
    const editForm = event.target;
    const orderId = editForm.querySelector('[data-edit-id]').value;
    if (orderId) {
        const order = state.orders[orderId];
        order.title = editForm.querySelector('[data-edit-title]').value;
        order.table = editForm.querySelector('[data-edit-table]').value;
        const newColumn = editForm.querySelector('[data-edit-column]').value;
        if (newColumn !== order.column) {
            // Move the order to the new column
            moveToColumn(orderId, newColumn);
            order.column = newColumn;
        }
        editForm.reset();
        html.edit.overlay.removeAttribute('open');
        html.other.add.focus(); // Return focus to the "Add Order" button
    }
};

const handleDelete = () => {
    const orderId = html.edit.id.value;

    // Remove the order from the state and the DOM
    delete state.orders[orderId];
    const orderElement = document.querySelector(`[data-id="${orderId}"]`);
    orderElement.remove();

    // Close the Edit Order overlay
    html.edit.overlay.close();
    html.other.add.focus(); // Return focus to Add Order button
};


html.other.add.addEventListener('click', handleAddToggle);
html.add.form.addEventListener('submit', handleAddSubmit);
html.other.help.addEventListener('click', handleHelpToggle);
html.other.grid.addEventListener('click', handleEditToggle);
html.edit.cancel.addEventListener('click', handleEditToggle);
html.edit.form.addEventListener('submit', handleEditSubmit);
html.edit.delete.addEventListener('click', handleDelete);

html.help.cancel.addEventListener('click', () => {
    html.help.overlay.removeAttribute('open');
    html.other.add.focus(); // Return focus to the "Add Order" button
});

// Add event listeners for drag-and-drop functionality
for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart);
    htmlColumn.addEventListener('dragend', handleDragEnd);
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver);
}