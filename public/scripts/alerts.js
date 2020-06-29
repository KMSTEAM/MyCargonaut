// TO-DO: help functions for sweetalert
alertError(error)
{
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    Swal.fire({
        icon: 'error',
        title: 'Oops.. Something went wrong!',
        text: errorMessage,
        footer: 'Error Code:' + errorCode
    })
}

alertConfirm(title, msg)
{
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: msg,
        showCloseButton: true,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
        timer: 1500
    });
}

alertSuccess(title) 
{
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        showConfirmButton: false,
        timer: 1500
    });
}
