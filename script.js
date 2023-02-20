"use strict"

//////////////////////////////////////////////////////////////////////////////////////////////////

// DATA - ACCOUNTS 

const account1 = {
  owner: "Patricia Kermit",
  movements: [1040, 2450, -180.45, -79, -2110.42, 6290, -20.13],
  interestRate: 1.4,
  pin: 7171,
  movementDates: [
    "2021-11-01T21:31:17.178Z",
    "2022-02-23T07:42:02.383Z",
    "2022-04-09T09:15:04.904Z",
    "2022-05-14T10:17:24.185Z",
    "2022-05-18T14:11:59.604Z",
    "2022-10-29T17:01:17.194Z",
    "2022-11-01T10:36:17.929Z",
  ],
  locale: 'el', // greek
  currency: 'EUR',
};

const account2 = {
  owner: "Randi Myrtie",
  movements: [12040, -3420.24, -150.9, -139, -2000],
  interestRate: 1.1,
  pin: 7272,
  movementDates: [
    "2021-10-18T21:31:17.178Z",
    "2021-12-23T07:42:02.383Z",
    "2022-02-28T09:15:04.904Z",
    "2022-10-19T10:17:21.185Z",
    "2022-11-01T14:11:59.604Z",
  ],
  locale: 'en-gb', // british
  currency: 'GBP',
};

const account3 = {
  owner: "Josie Jennie",
  movements: [940, 4550.1, -921, -50.7, -39, -1100, 142, -150, 90, -180],
  interestRate: 0.7,
  pin: 7373,
  movementDates: [
    "2020-10-09T13:15:33.035Z",
    "2020-11-03T09:48:16.867Z",
    "2020-12-25T06:04:23.907Z",
    "2021-01-25T14:18:46.235Z",
    "2021-02-05T16:33:06.386Z",
    "2021-04-10T14:43:26.374Z",
    "2022-06-25T18:49:59.371Z",
    "2022-09-26T12:01:20.894Z",
    "2022-10-28T17:01:17.194Z",
    "2022-11-01T21:36:17.929Z",
  ],
  locale: 'en-us', // american
  currency: 'USD',
};

const accounts = [account1, account2, account3];

//////////////////////////////////////////////////////////////////////////////////////////////////

// ELEMENTS

const loginSubmitEl = document.querySelector('.login__submit');
const mainEl = document.querySelector('.main');
const loginInputUserEl = document.querySelector('.login__input--user');
const loginInputPinEl = document.querySelector('.login__input--pin');
const welcomeMessageEl = document.querySelector('.welcome-message'); 
const movementsEl = document.querySelector('.movements');
const balanceValueEl = document.querySelector('.balance_value');
const summaryValueInEl = document.querySelector('.summary__value--in');
const summaryValueOutEl = document.querySelector('.summary__value--out');
const summaryValueInterestEl = document.querySelector('.summary__value--interest');
const logoutTimerEl = document.querySelector('.logout__timer');
const formBtnTransferEl = document.querySelector('.form__btn--transfer');
const formBtnLoanEl = document.querySelector('.form__btn--loan');
const formBtnCloseEl = document.querySelector('.form__btn--close');
const formInputToEl = document.querySelector('.form__input--to');
const formInputAmountTransferEl = document.querySelectorAll('.form__input--amount')[0];
const formInputAmountLoanEl = document.querySelectorAll('.form__input--amount')[1];
const formInputUserEl = document.querySelector('.form__input--user');
const formInputPinEl = document.querySelector('.form__input--pin');
const btnSortEl = document.querySelector('.btn--sort');
const dateEl = document.querySelector('.date');

//////////////////////////////////////////////////////////////////////////////////////////////////

// FUNCTIONS

const formatMovementDate = function(date, locale) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000*60*60*24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
}

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const createUsernames = function(accounts){
  for (const account of accounts) {
    account.username = account.owner.toLowerCase().split(' ').map(acc => acc[0]).join('');
  }
};
createUsernames(accounts);

const displayBalance = function(account){
  account.balance = account.movements.reduce((sum, mov) => sum + mov, 0);
  balanceValueEl.innerHTML = formatCurrency(account.balance, account.locale, account.currency);
};

const displaySummary = function(account){
  const income = account.movements.filter(mov => mov>0).reduce((sum, mov) => sum + mov, 0); 
  summaryValueInEl.textContent = formatCurrency(income, account.locale, account.currency);

  const outcome = account.movements.filter(mov => mov<0).reduce((sum, mov) => sum + mov, 0);
  summaryValueOutEl.textContent = formatCurrency(Math.abs(outcome), account.locale, account.currency);

  const interest = account.movements
    .filter(mov => mov>0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  summaryValueInterestEl.textContent = formatCurrency(interest, account.locale, account.currency);
}

const displayMovements = function(account){
  movementsEl.innerText = "";
  const movements = account.movements;

  movements.forEach(function(movement, i){
    const type = movement>0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    const formattedMov = formatCurrency(movement, account.locale, account.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    movementsEl.insertAdjacentHTML("afterbegin", html);
  });
};

const sortMovements = function(account){
  account.movements.sort((a, b) => a-b);
  displayMovements(account);
}

const updateUI = function (account) {
  // display balance
  displayBalance(account);

  // display summary
  displaySummary(account);

  // display movements
  displayMovements(account);
};

const startLogoutTimer = function(){
  const tick = function(){
    const minutes = String(Math.trunc(time/60)).padStart(2, 0);
    const seconds = String(time%60).padStart(2, 0);

    logoutTimerEl.textContent = `${minutes}:${seconds}`;
    if (time === 0){
      clearInterval(timer);
      // hide UI + change welcome message
      mainEl.style.opacity = 0;
      welcomeMessageEl.textContent = 'Log in to get started';
    }
    time--;
  }
  
  // time = 10min 
  let time = 10 * 60;
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// EVENT HANDLERS

let currentAccount, timer;

// user logs in
loginSubmitEl.addEventListener('click', function(e){
  // prevents form from submitting
  e.preventDefault();

  // if credentials are correct, display UI and welcome message
  accounts.forEach(acc => {
    if (loginInputUserEl.value === acc.username && Number(loginInputPinEl.value) === acc.pin){
      // set current account
      currentAccount = acc;
      // display UI
      mainEl.style.opacity = 100;
      // display welcome message
      welcomeMessageEl.textContent = `Welcome back, ${acc.owner.split(' ')[0]}`;
      // create current date and time
      const now = new Date();
      const options = {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      };
      dateEl.textContent = new Intl.DateTimeFormat(
        currentAccount.locale,
        options
      ).format(now);
      // clear inputs
      loginInputPinEl.value = '';
      loginInputUserEl.value = '';
      // start/restart logout timer
      if (timer) 
        clearInterval(timer);
      timer = startLogoutTimer();
      // update UI
      updateUI(currentAccount);
    }
  });
});

// user transfers money
formBtnTransferEl.addEventListener('click', function(e){
  // prevents form from submitting
  e.preventDefault();

  // get the recipient + amount to be transferred
  const recipientAcc = accounts.find(
    account => formInputToEl.value === account.username
  );
  const amount = Number(formInputAmountTransferEl.value);

  // clear inputs
  formInputToEl.value = '';
  formInputAmountTransferEl.value = '';

  if (
    amount > 0 && 
    recipientAcc && 
    recipientAcc?.username !== currentAccount.username && 
    amount <= currentAccount.balance
  ) {
    // doing the transfer
    currentAccount.movements.push(-amount);
    recipientAcc.movements.push(amount);

    // add transfer date
    currentAccount.movementDates.push(new Date().toISOString());
    recipientAcc.movementDates.push(new Date().toISOString());

    // update UI
    updateUI(currentAccount);
  }
});

// user requests loan
formBtnLoanEl.addEventListener('click', function(e){
  // prevents form from submitting
  e.preventDefault();

  // get the amount to be transferred
  const amount = Math.floor(formInputAmountLoanEl.value);

  // clear input
  formInputAmountLoanEl.value = '';

  if (
    amount > 0 &&
    currentAccount?.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function(){
      // get the loan from the bank
      currentAccount.movements.push(amount);

      // add loan date
      currentAccount.movementDates.push(new Date().toISOString());

      // update UI
      updateUI(currentAccount);
    }, 2500);
  }
});

// user closes account
formBtnCloseEl.addEventListener('click', function(e){
  // prevents form from submitting
  e.preventDefault();

  const user = formInputUserEl.value;
  const pin = Number(formInputPinEl.value);

  if (
    user === currentAccount?.username &&
    pin === currentAccount.pin
  ) {
    // find the index of the account in the accounts array that has to be deleted
    const indexOfAccount = accounts.findIndex(account => account.username === currentAccount.username);

    // delete the account
    accounts.splice(indexOfAccount, 1);

    // hide UI + change welcome message
    mainEl.style.opacity = 0;
    welcomeMessageEl.textContent = 'Log in to get started';
  }

  // clear inputs
  formInputUserEl.value = '';
  formInputPinEl.value = '';
});

// user sorts movements
btnSortEl.addEventListener('click', () => sortMovements(currentAccount));

//////////////////////////////////////////////////////////////////////////////////////////////////