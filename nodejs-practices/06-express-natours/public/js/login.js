//npm install axios
import { showAlert } from './alert.js'


//using ES6 feature module export (not the same as node module)
export const login = async (username, password) => {
  // console.log(username, password);

  try{
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        "userName": username,
        "password": password
      }
    });


    if (res.data.status === 'success'){
      showAlert('success', "You're logged in!");
      setTimeout(() => {
        location.assign('/');
      }, 1000)

    }

    console.log(res);
  }catch (e) {
    //ref at axios doc
    showAlert('error', e.response.data.message);
    // console.error(e.response.data);
  }

}


export const logout = async () => {
  try{
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });


    if (res.data.status === 'success'){
      location.reload(true);    //true => force reload from server (fresh reload everything from server), not from browser cache (still hold user variable)
    }

    console.log(res);
  }catch (e) {
    //ref at axios doc
    showAlert('error', e.response.data.message);
    // console.error(e.response.data);
  }

}


