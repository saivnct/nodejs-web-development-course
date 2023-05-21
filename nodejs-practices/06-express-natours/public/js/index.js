import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateData, updatePassword } from './acc-setting.js';


const mapElement = document.getElementById('map');
if (mapElement){
  const locations = JSON.parse(mapElement.dataset.locations);
// console.log(locations);
  displayMap(locations);
}


//region LOGIN LOGOUT
const loginForm = document.getElementById('login-form');
if (loginForm){
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    await login(username, password);
  });
}

const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn){
  logoutBtn.addEventListener('click', async (e) => {
    await logout();
  });
}
//endregion

//region ACC SETTING
const userDataForm = document.querySelector('.form-user-data');
if (userDataForm){
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const photo = document.getElementById('photo').files[0];

    const form = new FormData();
    form.append('name', name);
    form.append('photo', photo);

    await updateData(form);
  });
}


const updatePasswordForm = document.querySelector('.form-user-settings');
if (updatePasswordForm){
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...'

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('password-confirm').value;
    await updatePassword(currentPassword, password, repeatPassword);

    document.querySelector('.btn--save-password').textContent = 'Save password'
  });
}



//endregion