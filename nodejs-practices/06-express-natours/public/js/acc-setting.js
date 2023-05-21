import { showAlert } from './alert.js';

export const updateData = async(data) => {
  try{
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data
    });


    if (res.data.status === 'success'){
      showAlert('success', "Data updated successfully!");
      setTimeout(() => {
        location.reload(true);    //true => force reload from server (fresh reload everything from server), not from browser cache (still hold user variable)
      }, 1000)

    }

    // console.log(res);

  }catch (e) {
    //ref at axios doc
    showAlert('error', e.response.data.message);
    // console.error(e.response.data);
  }
}


export const updatePassword = async(currentPassword, password, repeatPassword) => {
  try{
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMyPassword',
      data: {
        currentPassword,
        password,
        repeatPassword,
      }
    });


    if (res.data.status === 'success'){
      showAlert('success', "Password updated successfully!");
      setTimeout(() => {
        location.reload(true);    //true => force reload from server (fresh reload everything from server), not from browser cache (still hold user variable)
      }, 1000)

    }

    // console.log(res);

  }catch (e) {
    //ref at axios doc
    showAlert('error', e.response.data.message);
    // console.error(e.response.data);
  }
}