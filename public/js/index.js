/* eslint-disable */
import '@babel/core';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { showAlert } from './alerts';
import axios from 'axios';

const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);

/* Helper Functions
/* ========================================================================== */

function parsePrice(number) {
  return number.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
}

function parseFloatHTML(element) {
  return parseFloat(element.innerHTML.replace(/[^\d\.\-]+/g, '')) || 0;
}

function updateNumber(e) {
  var activeElement = document.activeElement,
    value = parseFloat(activeElement.innerHTML),
    wasPrice =
      activeElement.innerHTML == parsePrice(parseFloatHTML(activeElement));

  if (!isNaN(value) && (e.keyCode == 38 || e.keyCode == 40 || e.wheelDeltaY)) {
    e.preventDefault();

    value +=
      e.keyCode == 38
        ? 1
        : e.keyCode == 40
        ? -1
        : Math.round(e.wheelDelta * 0.025);
    value = Math.max(value, 0);

    activeElement.innerHTML = wasPrice ? parsePrice(value) : value;
  }

  updateInvoice(getType());
}

// Update Invoice Total Cells
function updateInvoice(invoiceType) {
  var sumOfTotal = 0,
    sumOfProfit = 0;
  var cells, total, a, i;

  if (invoiceType == 'expenses') {
    for (
      var a = document.querySelectorAll('table.inventory tbody tr'), i = 0;
      a[i];
      ++i
    ) {
      // get inventory row cells
      cells = a[i].querySelectorAll('span');

      total = parseFloatHTML(cells[1]) * parseFloatHTML(cells[2]);

      sumOfTotal += total;

      cells[3].innerHTML = total;

      document.querySelector('table.meta tr:last-child td span').innerHTML =
        sumOfTotal;
    }
  } else if (invoiceType == 'purchases') {
    for (
      var a = document.querySelectorAll('table.inventory tbody tr'), i = 0;
      a[i];
      ++i
    ) {
      // get inventory row cells
      cells = a[i].querySelectorAll('span');

      total = parseFloatHTML(cells[2]) * parseFloatHTML(cells[3]);

      sumOfTotal += total;

      cells[4].innerHTML = total;

      document.querySelector('table.meta tr:last-child td span').innerHTML =
        sumOfTotal;
    }
  } else if (invoiceType == 'sales') {
    for (
      var a = document.querySelectorAll('table.inventory tbody tr'), i = 0;
      a[i];
      ++i
    ) {
      // get inventory row cells
      cells = a[i].querySelectorAll('span');

      total = parseFloatHTML(cells[2]) * parseFloatHTML(cells[3]);

      sumOfTotal += total;

      cells[4].innerHTML = total;

      document
        .querySelectorAll('table.meta tr')[3]
        .querySelector('td span').innerHTML = sumOfTotal;

      // Profit
      let profit = total - parseFloatHTML(cells[2]) * parseFloatHTML(cells[6]);

      sumOfProfit += profit;

      cells[8].innerHTML = profit;

      document
        .querySelectorAll('table.meta tr')[4]
        .querySelector('td span').innerHTML = sumOfProfit;
    }
  } else if (invoiceType == 'items') {
    for (
      var a = document.querySelectorAll(
          'table.inventory:nth-of-type(2) tbody tr'
        ),
        i = 0;
      a[i];
      ++i
    ) {
      // get inventory row cells
      cells = a[i].querySelectorAll('span');

      sumOfTotal += parseFloatHTML(cells[4]);

      document.querySelector('table.meta tr td span').innerHTML = sumOfTotal;
    }
  }
}

// Get Item Options List
async function createItemsListOnFirstRow() {
  const response = await axios.get('/api/v1/items/options');
  const options = response.data.data;

  document.getElementsByClassName('firstList')[0].innerHTML = options;
}

// Add New Table Row
function generateTableRow(invoiceType) {
  const emptyRow = document.createElement('tr');
  emptyRow.className = 'toDelete';

  if (invoiceType == 'expenses') {
    emptyRow.innerHTML =
      '<td><a class="cut">-</a><span>' +
      '<input class="toSave" list="expenses" type="text" placeholder="Type...">' +
      '</input>' +
      '</span></td>' +
      '<td><span class="toSave" contenteditable>0</span></td>' +
      '<td><span class="toSave" contenteditable>0</span></td>' +
      '<td><span class="toSave">0</span></td>';
  } else if (invoiceType == 'purchases') {
    emptyRow.innerHTML =
      '<td><a class="cut">-</a><span>' +
      '<input class="itemInput toSave" type="text" list="items" placeholder="Select or search...">' +
      '</input>' +
      '</span></td>' +
      '<td><span>' +
      '<select class="carInput toSave">' +
      '</select>' +
      '</span></td>' +
      '<td><span class="toSave" contenteditable>0</span></td>' +
      '<td><span class="toSave" contenteditable>0</span></td>' +
      '<td><span class="toSave">0</span></td>';
  } else if (invoiceType == 'sales') {
    emptyRow.innerHTML =
      '<td><a class="cut">-</a><span>' +
      '<input class="itemInput toSave" type="text" list="items" placeholder="Select or search...">' +
      '</input>' +
      '</span></td>' +
      '<td><span>' +
      '<select class="carInput toSave">' +
      '</select>' +
      '</span></td>' +
      '<td><span class="toSave" contenteditable>0</span></td>' +
      '<td><span class="toSave" contenteditable>0</span></td>' +
      '<td><span class="toSave">0</span></td>' +
      '<td><span class="toSave">0</span></td>' +
      '<td><span class="toSave">0</span></td>' +
      '<td><span class="toSave">0</span></td>' +
      '<td><span class="toSave">0</span></td>';
  } else if (invoiceType == 'items') {
    emptyRow.innerHTML =
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow">0</span></td>' +
      '<td><span class="toShow">0</span></td>' +
      '<td><span class="toShow">0</span></td>';
  }

  document.getElementById('tableBody').appendChild(emptyRow);

  updateInvoice(getType());
}

// Add New Report Row
function generateReportRow(reportType) {
  const emptyRow = document.createElement('tr');
  emptyRow.className = 'toDelete';

  if (['expenses', 'purchases'].includes(reportType)) {
    emptyRow.innerHTML =
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow">0</span></td>';
  } else if (reportType == 'sales') {
    emptyRow.innerHTML =
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow"></span></td>' +
      '<td><span class="toShow">0</span></td>' +
      '<td><span class="toShow">0</span></td>';
  }

  document.getElementById('tableBody').appendChild(emptyRow);

  updateReport(reportType);
}

// Delete Rows
async function deleteRows() {
  const tableBody = document.getElementById('tableBody');
  let tableRows = tableBody.getElementsByClassName('toDelete');
  const len = tableRows.length;

  for (let i = len - 1; i >= 0; i--) {
    // i = 0 along because tableRows updated when remove row
    tableRows[i].remove();
  }
}

// Read Invoice
async function readInvoice(invoiceType) {
  const invoiceNumber = document.getElementById('search').value;

  if (invoiceNumber) {
    try {
      const response = await axios({
        method: 'GET',
        url: `/api/v1/${invoiceType}/invoice/${invoiceNumber}`,
      });

      const data = response.data.data;

      // Alert that No Invoice With This Number
      if (!data)
        showAlert(
          'message',
          `There is no ${invoiceType} invoice with this number! Please enter valid number...`
        );
      else {
        // Make Empty Table With Single Row
        await deleteRows();

        // Generate Empty Table
        for (let i = 1; i < data.items.length; i++) {
          generateTableRow(invoiceType);
        }

        // Hold Cells From Meta Table and Inventory Table
        const meta = document.getElementsByClassName('meta')[0];
        let metaData = meta.getElementsByClassName('toSave');

        let inventory = document.getElementsByClassName('inventory')[0];
        let inventoryData = inventory.getElementsByClassName('toSave');

        let saveButton = document.getElementById('save');

        // Disable Cut And Add Buttons
        inventory.parentNode.getElementsByClassName('add')[0].style.display =
          'none';

        const cutButtons = inventory.getElementsByClassName('cut');
        for (let i = 0; i < cutButtons.length; i++)
          cutButtons[i].style.display = 'none';

        // Initialize Meta Data
        metaData[0].innerHTML = data.number;

        const fullDate = new Date(data.date);
        const day = fullDate.getDate();
        const month = fullDate.getMonth() + 1;
        const year = fullDate.getFullYear();

        metaData[1].innerHTML = `${day} / ${month} / ${year}`;
        metaData[3].innerHTML = data.total;

        if (invoiceType == 'expenses') {
          saveButton.style.display = 'none';

          metaData[2].disabled = true;
          metaData[2].value = data.spender;

          // Initialize EXPENSES Inventory Data
          for (let i = 0, j = 0; i < inventoryData.length; j++) {
            inventoryData[i].disabled = true;
            inventoryData[i++].value = data.items[j].name;

            inventoryData[i].contentEditable = false;
            inventoryData[i++].innerHTML = data.items[j].quantity;

            inventoryData[i].contentEditable = false;
            inventoryData[i++].innerHTML = data.items[j].price;

            inventoryData[i++].innerHTML = data.items[j].total;
          }
        } else if (invoiceType == 'purchases') {
          metaData[2].disabled = true;
          metaData[2].value = data.buyer;

          // Initialize PURCHASES Inventory Data
          for (let i = 0, j = 0; i < inventoryData.length; j++) {
            inventoryData[i].disabled = true;
            inventoryData[i++].value = data.items[j].name;

            inventoryData[i].disabled = true;
            inventoryData[
              i
            ].innerHTML = `<option value='${data.items[j].car}'>${data.items[j].car}</option>`;
            inventoryData[i++].value = data.items[j].car;

            inventoryData[i++].innerHTML = data.items[j].quantity;

            inventoryData[i].contentEditable = false;
            inventoryData[i++].innerHTML = data.items[j].price;

            inventoryData[i++].innerHTML = data.items[j].total;
          }
        } else if (invoiceType == 'sales') {
          metaData[2].disabled = true;
          metaData[2].value = data.seller;

          metaData[4].innerHTML = data.totalProfit;
          // Initialize SALES Inventory Data
          for (let i = 0, j = 0; i < inventoryData.length; j++) {
            inventoryData[i].disabled = true;
            inventoryData[i++].value = data.items[j].name;

            inventoryData[i].disabled = true;
            inventoryData[
              i
            ].innerHTML = `<option value='${data.items[j].car}'>${data.items[j].car}</option>`;
            inventoryData[i++].value = data.items[j].car;

            inventoryData[i++].innerHTML = data.items[j].quantity;

            inventoryData[i].contentEditable = false;
            inventoryData[i++].innerHTML = data.items[j].price;

            inventoryData[i++].innerHTML = data.items[j].total;
            inventoryData[i++].innerHTML = data.items[j].stockQuantity;
            inventoryData[i++].innerHTML = data.items[j].averagePrice;
            inventoryData[i++].innerHTML = data.items[j].stockTotal;
            inventoryData[i++].innerHTML = data.items[j].profit;
          }
        }

        updateInvoice(getType());
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  }
}

// Create Expenses Invoice
async function createExpensesInvoice() {
  try {
    // Get Data From Meta Table and Inventory Table
    const meta = document.getElementsByClassName('meta')[0];
    const metaData = meta.getElementsByClassName('toSave');

    const inventory = document.getElementsByClassName('inventory')[0];
    const inventoryData = inventory.getElementsByClassName('toSave');

    let items = [];
    // Initialize Inventory Data
    for (let i = 0; i < inventoryData.length; i += 4) {
      let row = {
        name: inventoryData[i].value,
        quantity: +Number(inventoryData[i + 1].innerHTML),
        price: +Number(inventoryData[i + 2].innerHTML).toFixed(2),
        total: +Number(inventoryData[i + 3].innerHTML).toFixed(2),
      };
      items.push(row);
    }

    // Initialize Meta Data
    let data = JSON.stringify({
      number: metaData[0].innerHTML,
      date: new Date(),
      spender: metaData[2].value,
      total: +Number(metaData[3].innerHTML).toFixed(2),
      items: items,
    });

    const res = await axios({
      method: 'POST',
      url: '/api/v1/expenses/invoice',
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.data.status === 'success') {
      // Update Wallet
      const userRes = await axios({
        method: 'GET',
        url: `/api/v1/users/wallet/${metaData[2].value}`,
      });

      let user = userRes.data.data;
      user.wallet -= +Number(metaData[3].innerHTML).toFixed(2);

      await axios({
        method: 'PATCH',
        url: `/api/v1/users/wallet/${metaData[2].value}`,
        data: user,
      });

      showAlert('success', 'Invoice Saved Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// Create Purchases Invoice
async function createPurchasesInvoice() {
  try {
    // Get Data From Meta Table and Inventory Table
    const meta = document.getElementsByClassName('meta')[0];
    const metaData = meta.getElementsByClassName('toSave');

    const inventory = document.getElementsByClassName('inventory')[0];
    const inventoryData = inventory.getElementsByClassName('toSave');

    let items = [];
    // Initialize Inventory Data
    for (let i = 0; i < inventoryData.length; i += 5) {
      let row = {
        name: inventoryData[i].value,
        car: inventoryData[i + 1].value,
        quantity: +Number(inventoryData[i + 2].innerHTML),
        price: +Number(inventoryData[i + 3].innerHTML).toFixed(2),
        total: +Number(inventoryData[i + 4].innerHTML).toFixed(2),
      };
      items.push(row);
    }

    // Initialize Meta Data
    let data = JSON.stringify({
      number: metaData[0].innerHTML,
      date: new Date(),
      buyer: metaData[2].value,
      total: +Number(metaData[3].innerHTML).toFixed(2),
      items: items,
    });

    const res = await axios({
      method: 'POST',
      url: '/api/v1/purchases/invoice',
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.data.status === 'success') {
      // Update Wallet
      const userRes = await axios({
        method: 'GET',
        url: `/api/v1/users/wallet/${metaData[2].value}`,
      });

      let user = userRes.data.data;
      user.wallet -= +Number(metaData[3].innerHTML).toFixed(2);

      await axios({
        method: 'PATCH',
        url: `/api/v1/users/wallet/${metaData[2].value}`,
        data: user,
      });

      // Update Quantity and Average Price For Every Item
      for (let i = 0; i < inventoryData.length; i += 5) {
        const itemRes = await axios({
          method: 'GET',
          url: `/api/v1/items/${inventoryData[i].value}/${
            inventoryData[i + 1].value
          }`,
        });

        let item = itemRes.data.data;

        item.quantity += +Number(inventoryData[i + 2].innerHTML);
        item.total += +Number(inventoryData[i + 4].innerHTML).toFixed(2);
        item.averagePrice = +Number(item.total / item.quantity).toFixed(2);

        await axios({
          method: 'PATCH',
          url: `/api/v1/items/${inventoryData[i].value}/${
            inventoryData[i + 1].value
          }`,
          data: item,
        });
      }

      showAlert('success', 'Invoice Saved Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// Create Sales Invoice
async function createSalesInvoice() {
  try {
    // Get Data From Meta Table and Inventory Table
    const meta = document.getElementsByClassName('meta')[0];
    const metaData = meta.getElementsByClassName('toSave');

    const inventory = document.getElementsByClassName('inventory')[0];
    const inventoryData = inventory.getElementsByClassName('toSave');

    let items = [];
    // Initialize Inventory Data
    for (let i = 0; i < inventoryData.length; i += 9) {
      let row = {
        name: inventoryData[i].value,
        car: inventoryData[i + 1].value,
        quantity: +Number(inventoryData[i + 2].innerHTML),
        price: +Number(inventoryData[i + 3].innerHTML).toFixed(2),
        total: +Number(inventoryData[i + 4].innerHTML).toFixed(2),
        stockQuantity: inventoryData[i + 5].innerHTML,
        averagePrice: inventoryData[i + 6].innerHTML,
        stockTotal: inventoryData[i + 7].innerHTML,
        profit: inventoryData[i + 8].innerHTML,
      };
      items.push(row);
    }

    // Initialize Meta Data
    let data = JSON.stringify({
      number: metaData[0].innerHTML,
      date: new Date(),
      seller: metaData[2].value,
      total: +Number(metaData[3].innerHTML).toFixed(2),
      totalProfit: +Number(metaData[4].innerHTML).toFixed(2),
      items: items,
    });

    const res = await axios({
      method: 'POST',
      url: '/api/v1/sales/invoice',
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.data.status === 'success') {
      // Update Wallet
      const userRes = await axios({
        method: 'GET',
        url: `/api/v1/users/wallet/${metaData[2].value}`,
      });

      let user = userRes.data.data;
      user.wallet += +Number(metaData[3].innerHTML).toFixed(2);

      await axios({
        method: 'PATCH',
        url: `/api/v1/users/wallet/${metaData[2].value}`,
        data: user,
      });

      // Update Quantity and Average Price For Every Item
      for (let i = 0; i < inventoryData.length; i += 9) {
        const itemRes = await axios({
          method: 'GET',
          url: `/api/v1/items/${inventoryData[i].value}/${
            inventoryData[i + 1].value
          }`,
        });

        let item = itemRes.data.data;

        item.quantity -= +Number(inventoryData[i + 2].innerHTML).toFixed(2);
        item.total -= +Number(
          Number(inventoryData[i + 2].innerHTML) *
            Number(inventoryData[i + 6].innerHTML)
        ).toFixed(2);

        await axios({
          method: 'PATCH',
          url: `/api/v1/items/${inventoryData[i].value}/${
            inventoryData[i + 1].value
          }`,
          data: item,
        });
      }

      showAlert('success', 'Invoice Saved Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// Update Purchases Invoice
async function updatePurchasesInvoice() {
  const invoiceNumber = document.getElementById('search').value;

  if (invoiceNumber) {
    try {
      // Get Native Invoice
      let nativeInvoice = await axios({
        method: 'GET',
        url: `/api/v1/purchases/invoice/${invoiceNumber}`,
      });

      nativeInvoice = nativeInvoice.data.data;
      let updatedInvoice = { ...nativeInvoice };

      // Get Data From Meta Table and Inventory Table
      const meta = document.getElementsByClassName('meta')[0];
      const metaData = meta.getElementsByClassName('toSave');

      const inventory = document.getElementsByClassName('inventory')[0];
      const inventoryData = inventory.getElementsByClassName('toSave');

      let items = [];
      // Initialize Inventory Data
      for (let i = 0; i < inventoryData.length; i += 5) {
        let row = {
          name: inventoryData[i].value,
          car: inventoryData[i + 1].value,
          quantity: +Number(inventoryData[i + 2].innerHTML),
          price: +Number(inventoryData[i + 3].innerHTML).toFixed(2),
          total: +Number(inventoryData[i + 4].innerHTML).toFixed(2),
        };
        items.push(row);
      }

      updatedInvoice.total = +Number(metaData[3].innerHTML).toFixed(2);
      updatedInvoice.items = items;

      const res = await axios({
        method: 'PATCH',
        url: `/api/v1/purchases/invoice/${invoiceNumber}`,
        data: updatedInvoice,
      });

      if (res.data.status === 'success') {
        // Update Wallet
        const userRes = await axios({
          method: 'GET',
          url: `/api/v1/users/wallet/${metaData[2].value}`,
        });

        let user = userRes.data.data;
        user.wallet += +Number(
          nativeInvoice.total - Number(metaData[3].innerHTML)
        ).toFixed(2);

        await axios({
          method: 'PATCH',
          url: `/api/v1/users/wallet/${metaData[2].value}`,
          data: user,
        });

        nativeInvoice = nativeInvoice.items;
        // Update Quantity And Stock Total For Every Item
        for (let i = 0, j = 0; i < inventoryData.length; i += 5, j++) {
          const itemRes = await axios({
            method: 'GET',
            url: `/api/v1/items/${inventoryData[i].value}/${
              inventoryData[i + 1].value
            }`,
          });

          let item = itemRes.data.data;

          item.quantity -= +Number(
            nativeInvoice[j].quantity - Number(inventoryData[i + 2].innerHTML)
          ).toFixed(2);

          item.total -= +Number(
            (nativeInvoice[j].quantity -
              Number(inventoryData[i + 2].innerHTML)) *
              nativeInvoice[j].price
          ).toFixed(2);

          item.averagePrice = +Number(item.total / item.quantity).toFixed(2);

          await axios({
            method: 'PATCH',
            url: `/api/v1/items/${inventoryData[i].value}/${
              inventoryData[i + 1].value
            }`,
            data: item,
          });
        }

        showAlert('success', 'Invoice Updated Successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 500);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  }
}

// Update Sales Invoice
async function updateSalesInvoice() {
  const invoiceNumber = document.getElementById('search').value;

  if (invoiceNumber) {
    try {
      // Get Native Invoice
      let nativeInvoice = await axios({
        method: 'GET',
        url: `/api/v1/sales/invoice/${invoiceNumber}`,
      });

      nativeInvoice = nativeInvoice.data.data;
      let updatedInvoice = { ...nativeInvoice };

      // Get Data From Meta Table and Inventory Table
      const meta = document.getElementsByClassName('meta')[0];
      const metaData = meta.getElementsByClassName('toSave');

      const inventory = document.getElementsByClassName('inventory')[0];
      const inventoryData = inventory.getElementsByClassName('toSave');

      let items = [];
      // Initialize Inventory Data
      for (let i = 0; i < inventoryData.length; i += 9) {
        let row = {
          name: inventoryData[i].value,
          car: inventoryData[i + 1].value,
          quantity: +Number(inventoryData[i + 2].innerHTML),
          price: +Number(inventoryData[i + 3].innerHTML).toFixed(2),
          total: +Number(inventoryData[i + 4].innerHTML).toFixed(2),
          stockQuantity: inventoryData[i + 5].innerHTML,
          averagePrice: inventoryData[i + 6].innerHTML,
          stockTotal: inventoryData[i + 7].innerHTML,
          profit: inventoryData[i + 8].innerHTML,
        };
        items.push(row);
      }

      updatedInvoice.total = +Number(metaData[3].innerHTML).toFixed(2);
      updatedInvoice.totalProfit = +Number(metaData[4].innerHTML).toFixed(2);
      updatedInvoice.items = items;

      const res = await axios({
        method: 'PATCH',
        url: `/api/v1/sales/invoice/${invoiceNumber}`,
        data: updatedInvoice,
      });

      if (res.data.status === 'success') {
        // Update Wallet
        const userRes = await axios({
          method: 'GET',
          url: `/api/v1/users/wallet/${metaData[2].value}`,
        });

        let user = userRes.data.data;
        user.wallet -= +Number(
          nativeInvoice.total - Number(metaData[3].innerHTML)
        ).toFixed(2);

        await axios({
          method: 'PATCH',
          url: `/api/v1/users/wallet/${metaData[2].value}`,
          data: user,
        });

        nativeInvoice = nativeInvoice.items;
        // Update Quantity And Stock Total For Every Item
        for (let i = 0, j = 0; i < inventoryData.length; i += 9, j++) {
          const itemRes = await axios({
            method: 'GET',
            url: `/api/v1/items/${inventoryData[i].value}/${
              inventoryData[i + 1].value
            }`,
          });

          let item = itemRes.data.data;

          item.quantity += +Number(
            nativeInvoice[j].quantity - Number(inventoryData[i + 2].innerHTML)
          ).toFixed(2);

          item.total += +Number(
            (nativeInvoice[j].quantity -
              Number(inventoryData[i + 2].innerHTML)) *
              nativeInvoice[j].averagePrice
          ).toFixed(2);

          await axios({
            method: 'PATCH',
            url: `/api/v1/items/${inventoryData[i].value}/${
              inventoryData[i + 1].value
            }`,
            data: item,
          });
        }

        showAlert('success', 'Invoice Updated Successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 500);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  }
}

// Save Invoice
async function saveInvoice(invoiceType) {
  try {
    const invoiceNumber = document.getElementById('number').innerHTML;

    if (invoiceNumber) {
      const response = await axios({
        method: 'GET',
        url: `/api/v1/${invoiceType}/invoice/${invoiceNumber}`,
      });

      const data = response.data.data;

      // Save OR Update
      if (data && invoiceType == 'purchases')
        updatePurchasesInvoice(); // For ThrowBack
      else if (data && invoiceType == 'sales')
        updateSalesInvoice(); // For ThrowBack
      else if (invoiceType == 'expenses') createExpensesInvoice();
      else if (invoiceType == 'purchases') createPurchasesInvoice();
      else if (invoiceType == 'sales') createSalesInvoice();
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// readAllItems
async function readAllItems(invoiceType) {
  try {
    const response = await axios({
      method: 'GET',
      url: `/api/v1/items`,
    });

    const data = response.data.data;

    // Generate Empty Table
    for (let i = 1; i < data.length; i++) {
      generateTableRow(invoiceType);
    }

    // Hold Cells From Inventory Table
    let inventory = document.getElementsByClassName('inventory')[1];
    let inventoryData = inventory.getElementsByClassName('toShow');

    // Initialize PURCHASES Inventory Data
    for (let i = 0, j = 0; i < inventoryData.length; j++) {
      inventoryData[i++].innerHTML = data[j].name;

      inventoryData[i++].innerHTML = data[j].car;

      inventoryData[i++].innerHTML = data[j].quantity;

      inventoryData[i++].innerHTML = data[j].averagePrice;

      inventoryData[i++].innerHTML = data[j].total;
    }

    updateInvoice(getType());
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// Add New Item
async function addNewItem() {
  try {
    // Show Save Button
    let saveButton = document.getElementById('save');
    saveButton.style.display = 'block';

    // Hold Cells From Inventory Table
    let inventory = document.getElementsByClassName('inventory')[0];
    let inventoryData = inventory.getElementsByClassName('toSave');

    // Make Cells Empty To Input
    let itemInputParent = inventoryData[0].parentNode;
    itemInputParent.innerHTML =
      '<input class="itemInput toSave" placeholder="Write Name...">';

    let carInputParent = inventoryData[1].parentNode;
    carInputParent.innerHTML =
      '<input class="carInput toSave" placeholder="Write Car...">';

    inventoryData[2].innerHTML = 0;
    inventoryData[3].innerHTML = 0;
    inventoryData[4].innerHTML = 0;

    let addButton = document.getElementById('add');
    addButton.style.display = 'none';
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// Save New Item
async function saveNewItem() {
  try {
    // Get Data From Inventory Table
    const inventory = document.getElementsByClassName('inventory')[0];
    const inventoryData = inventory.getElementsByClassName('toSave');

    // Initialize Item Data
    let data = {};
    data.name = inventoryData[0].value;
    data.car = inventoryData[1].value;
    data = JSON.stringify(data);

    const getRes = await axios({
      method: 'GET',
      url: `/api/v1/items/${inventoryData[0].value}/${inventoryData[1].value}`,
    });

    if (getRes.data.data) {
      showAlert('message', 'This Item Already Exist !');
    } else {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/items',
        data,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data.status === 'success') {
        generateTableRow(getType());

        const tableBody = document.getElementById('tableBody');
        let lastRow = tableBody.lastChild.getElementsByClassName('toShow');

        lastRow[0].innerHTML = inventoryData[0].value;
        lastRow[1].innerHTML = inventoryData[1].value;

        showAlert('success', 'Item Saved Successfully!');
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// Check Profit Total Cells
async function checkProfit() {
  // Get Now Date
  const nowDate = new Date();
  const nowYear = nowDate.getFullYear();
  const nowMonth = nowDate.getMonth() + 1;

  // Get Date Of Report
  const reportYear = Number(document.getElementById('searchYear').value);
  const reportMonth = Number(document.getElementById('searchMonth').value);

  // Get Last Date Profit Taken
  const response = await axios({
    method: 'GET',
    url: `/api/v1/users`,
  });
  const lastTimeProfitTaken =
    response.data.data[0].lastTimeProfitTaken.split('-');
  const lastYear = Number(lastTimeProfitTaken[0]);
  const lastMonth = Number(lastTimeProfitTaken[1]);

  if (
    (nowYear > reportYear || nowMonth > reportMonth) &&
    (reportYear > lastYear || reportMonth > lastMonth)
  ) {
    document.getElementById('takeProfit').style.display = 'block';
  } else {
    document.getElementById('takeProfit').style.display = 'none';
  }
}

// Read Report
async function readReport(reportType) {
  const reportYear = document.getElementById('searchYear').value;
  const reportMonth = document.getElementById('searchMonth').value;

  if (reportMonth && reportYear) {
    try {
      const response = await axios({
        method: 'GET',
        url: `/api/v1/${reportType}/${reportYear}/${reportMonth}`,
      });

      const data = response.data.data;

      // Alert that No Invoice With This Number
      if (!data.length) {
        showAlert('message', `It Appears That You Entered An Invalid Date...`);
        window.setTimeout(() => {
          location.assign('/');
        }, 1000);
      } else {
        // Make Empty Table With Single Row
        await deleteRows();

        // Generate Empty Table
        for (let i = 1; i < data.length; i++) {
          generateReportRow(reportType);
        }

        // Hold Cells Inventory Table
        let inventory = document.getElementsByClassName('inventory')[0];
        let inventoryData = inventory.getElementsByClassName('toShow');

        if (reportType == 'expenses') {
          // Initialize EXPENSES Inventory Data
          for (let i = 0, j = 0; i < inventoryData.length; j++) {
            inventoryData[i++].innerHTML = data[j].number;

            const fullDate = new Date(data[j].date);
            const day = fullDate.getDate();
            const month = fullDate.getMonth() + 1;
            const year = fullDate.getFullYear();

            inventoryData[i++].innerHTML = `${day} / ${month} / ${year}`;

            inventoryData[i++].innerHTML = data[j].spender;

            inventoryData[i++].innerHTML = data[j].total;
          }
        } else if (reportType == 'purchases') {
          for (let i = 0, j = 0; i < inventoryData.length; j++) {
            inventoryData[i++].innerHTML = data[j].number;

            const fullDate = new Date(data[j].date);
            const day = fullDate.getDate();
            const month = fullDate.getMonth() + 1;
            const year = fullDate.getFullYear();

            inventoryData[i++].innerHTML = `${day} / ${month} / ${year}`;

            inventoryData[i++].innerHTML = data[j].buyer;

            inventoryData[i++].innerHTML = data[j].total;
          }
        } else if (reportType == 'sales') {
          for (let i = 0, j = 0; i < inventoryData.length; j++) {
            inventoryData[i++].innerHTML = data[j].number;

            const fullDate = new Date(data[j].date);
            const day = fullDate.getDate();
            const month = fullDate.getMonth() + 1;
            const year = fullDate.getFullYear();

            inventoryData[i++].innerHTML = `${day} / ${month} / ${year}`;

            inventoryData[i++].innerHTML = data[j].seller;

            inventoryData[i++].innerHTML = data[j].total;

            inventoryData[i++].innerHTML = data[j].totalProfit;
          }
        }

        updateReport(reportType);
        checkProfit();
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  }
}

// Update Report Total Cells
async function updateReport(reportType) {
  var sumOfTotal = 0,
    sumOfProfit = 0;

  var cells, a, i;

  if (['expenses', 'purchases'].includes(reportType)) {
    for (
      var a = document.querySelectorAll('table.inventory tbody tr'), i = 0;
      a[i];
      ++i
    ) {
      // get inventory row cells
      cells = a[i].querySelectorAll('span');

      sumOfTotal += parseFloatHTML(cells[3]);
    }

    document.querySelector('table.meta tr td span').innerHTML = sumOfTotal;
  } else if (['sales'].includes(reportType)) {
    for (
      var a = document.querySelectorAll('table.inventory tbody tr'), i = 0;
      a[i];
      ++i
    ) {
      // get inventory row cells
      cells = a[i].querySelectorAll('span');

      sumOfTotal += parseFloatHTML(cells[3]);
      sumOfProfit += parseFloatHTML(cells[4]);
    }

    let metaRows = document.querySelectorAll('table.meta tr');

    metaRows[0].querySelector('td span').innerHTML = sumOfTotal;
    metaRows[1].querySelector('td span').innerHTML = sumOfProfit;

    // Get Expenses Of Month
    const reportYear = document.getElementById('searchYear').value;
    const reportMonth = document.getElementById('searchMonth').value;

    const response = await axios({
      method: 'GET',
      url: `/api/v1/expenses/total/${reportYear}/${reportMonth}`,
    });

    let totalExpenses = 0;
    if (response.data.data.length) {
      totalExpenses = response.data.data[0].sum;
    }
    metaRows[2].querySelector('td span').innerHTML = totalExpenses;

    metaRows[3].querySelector('td span').innerHTML =
      sumOfProfit - totalExpenses;
  }
}

// Take Profit Total Cells
async function takeProfit() {
  const reportYear = Number(document.getElementById('searchYear').value);
  const reportMonth = Number(document.getElementById('searchMonth').value);

  const response = await axios({
    method: 'GET',
    url: `/api/v1/users`,
  });

  let users = response.data.data;
  const netProfit = +Number(
    document.querySelector('table.meta tr:last-child td span').innerHTML
  ).toFixed(2);

  for (let i = 0; i < users.length; i++) {
    users[i].wallet -= Number(users[i].profitRatio) * netProfit;
    users[i].lastTimeProfitTaken = new Date(reportYear, reportMonth);

    await axios({
      method: 'PATCH',
      url: `/api/v1/users`,
      data: {
        name: users[i].name,
        wallet: +users[i].wallet.toFixed(2),
        lastTimeProfitTaken: users[i].lastTimeProfitTaken,
      },
    });
  }

  showAlert('message', `Users Take Profit Successfully...`, 1);

  document.getElementById('takeProfit').style.display = 'none';
}

// Get All Users
async function getAllUsers() {
  const response = await axios({
    method: 'GET',
    url: `/api/v1/users`,
  });

  const users = response.data.data;

  for (let i = 0; i < users.length; i++) {
    const emptyRow = document.createElement('tr');

    const fullDate = users[i].lastTimeProfitTaken.split('-');

    const date = `${fullDate[2].slice(0, 2)} / ${fullDate[1]} / ${fullDate[0]}`;

    emptyRow.innerHTML =
      `<td><span class="toShow">${users[i].name}</span></td>` +
      `<td><span class="toShow">${users[i].wallet}</span></td>` +
      `<td><span class="toShow">${date}</span></td>` +
      `<td><span class="toShow">${(users[i].profitRatio * 100).toFixed(
        2
      )} %</span></td>` +
      `<td><span class="toShow">${users[i].capital}</span></td>`;

    document.getElementById('tableBody').appendChild(emptyRow);

    const option = `<option value='${users[i].name}'></option>`;

    document.getElementById('users').innerHTML += option;
  }
}

// Transfer Money Between Users
async function sendMoney() {
  const senderName = document.getElementById('sender').value;
  const recipientName = document.getElementById('recipient').value;
  const amount = +Number(document.getElementById('amount').value).toFixed(2);

  if (senderName && recipientName && amount) {
    const sender = await axios({
      method: 'GET',
      url: `/api/v1/users/wallet/${senderName}`,
    });

    const recipient = await axios({
      method: 'GET',
      url: `/api/v1/users/wallet/${recipientName}`,
    });

    let senderWallet = sender.data.data.wallet;
    let recipientWallet = recipient.data.data.wallet;

    if (senderWallet >= amount) {
      senderWallet -= amount;
      recipientWallet += amount;

      await axios({
        method: 'PATCH',
        url: `/api/v1/users/wallet/${senderName}`,
        data: {
          wallet: +senderWallet.toFixed(2),
        },
      });

      await axios({
        method: 'PATCH',
        url: `/api/v1/users/wallet/${recipientName}`,
        data: {
          wallet: +recipientWallet.toFixed(2),
        },
      });

      showAlert('message', `Money Sent Successfully...`, 1);
      window.setTimeout(() => {
        location.assign('/');
      }, 300);
    } else {
      showAlert(
        'message',
        `Amount Should Be Less Than Or Equal Sender Wallet...`,
        1
      );
    }
  } else {
    showAlert('message', `Enter Required Data To Send...`, 1);
  }
}

// Set Invoice Number
async function setNumber(invoiceType) {
  try {
    let number = document.getElementById('number');

    const response = await axios({
      method: 'GET',
      url: `/api/v1/${invoiceType}/last`,
    });

    const data = response.data.data;

    number.innerHTML = data ? data.number + 1 : 1;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

// Get Now Date For New Invoice
function getNowDate() {
  let date = document.getElementById('date');

  const fullDate = new Date();
  const day = fullDate.getDate();
  const month = fullDate.getMonth() + 1; // Month starts from 0 (January is 0)
  const year = fullDate.getFullYear();

  date.innerHTML = `${day} / ${month} / ${year}`;
}

// On Click
async function onClick(e) {
  // Remove One Row and Update Invoice
  if (e.target.className == 'cut') {
    let row = e.target.parentNode.parentNode;
    row.parentNode.removeChild(row);

    updateInvoice(getType());
  }
}

// On Change
async function onChange(e) {
  const invoiceType = document
    .getElementsByTagName('h1')[0]
    .innerHTML.split(' ')[0]
    .toLowerCase();

  // Get Cars Avaliable For Current Item
  if (e.target.className == 'itemInput toSave') {
    const itemName = e.target.value;

    if (itemName) {
      const response = await axios.get(`/api/v1/items/${itemName}`);

      const carOptions = response.data.data;

      e.target.parentNode.parentNode.parentNode.getElementsByClassName(
        'carInput'
      )[0].innerHTML = carOptions;
    }
  } else if (
    e.target.className == 'carInput toSave' &&
    invoiceType == 'sales'
  ) {
    const itemName =
      e.target.parentNode.parentNode.parentNode.getElementsByClassName(
        'itemInput'
      )[0].value;
    const carName = e.target.value;

    if (carName) {
      const response = await axios.get(`/api/v1/items/${itemName}/${carName}`);

      const item = response.data.data;

      let toSaveCells =
        e.target.parentNode.parentNode.parentNode.getElementsByClassName(
          'toSave'
        );

      toSaveCells[5].innerHTML = item.quantity;
      toSaveCells[6].innerHTML = item.averagePrice;
      toSaveCells[7].innerHTML = item.total;
    }
  } else if (
    e.target.className == 'carInput toSave' &&
    invoiceType == 'items'
  ) {
    const itemName =
      e.target.parentNode.parentNode.parentNode.getElementsByClassName(
        'itemInput'
      )[0].value;
    const carName = e.target.value;

    if (carName) {
      const response = await axios.get(`/api/v1/items/${itemName}/${carName}`);

      const item = response.data.data;

      let toSaveCells =
        e.target.parentNode.parentNode.parentNode.getElementsByClassName(
          'toSave'
        );

      toSaveCells[2].innerHTML = item.quantity;
      toSaveCells[3].innerHTML = item.averagePrice;
      toSaveCells[4].innerHTML = item.total;
    }
  }
}

// Select Invoice Type
function getType() {
  return document
    .getElementsByTagName('h1')[0]
    .innerHTML.split(' ')[0]
    .toLowerCase();
}

/* On Content Load
/* ========================================================================== */

function onContentLoad() {
  const currentUrl = window.location.href.split('/');
  const invoiceType = currentUrl[currentUrl.length - 1];
  const reportType = currentUrl[currentUrl.length - 2];

  if (['purchases', 'sales', 'items'].includes(invoiceType)) {
    createItemsListOnFirstRow();

    document.addEventListener('change', onChange);
  }

  // INVOICE
  if (['me'].includes(invoiceType)) {
    getAllUsers();

    document.getElementById('send').addEventListener('click', () => {
      sendMoney();
    });
  } else if (['expenses', 'purchases', 'sales'].includes(invoiceType)) {
    updateInvoice(getType());
    setNumber(getType());
    getNowDate();

    document.addEventListener('click', onClick);

    document.addEventListener('wheel', updateNumber);
    document.addEventListener('keydown', updateNumber);
    document.addEventListener('keyup', updateNumber);

    document.getElementById('add').addEventListener('click', () => {
      generateTableRow(getType());
    });

    document.getElementById('save').addEventListener('click', () => {
      saveInvoice(getType());
    });

    document.getElementById('search').addEventListener('change', () => {
      readInvoice(getType());
    });
  }
  // ITEMS
  else if (['items'].includes(invoiceType)) {
    readAllItems(getType());

    document.addEventListener('wheel', updateNumber);
    document.addEventListener('keydown', updateNumber);

    document.getElementById('add').addEventListener('click', () => {
      addNewItem();
    });

    document.getElementById('save').addEventListener('click', () => {
      saveNewItem();
    });
  }
  // REPORT
  else if (['expenses', 'purchases', 'sales'].includes(reportType)) {
    document.getElementById('searchMonth').addEventListener('change', () => {
      readReport(reportType);
    });

    document.getElementById('searchYear').addEventListener('change', () => {
      readReport(reportType);
    });
  }

  if (['sales'].includes(reportType)) {
    document.getElementById('takeProfit').addEventListener('click', () => {
      takeProfit();
    });
  }
}

document.addEventListener('DOMContentLoaded', onContentLoad);
