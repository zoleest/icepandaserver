function drawAdminNotificationDropdown(data) {
    let counter = 0;

    for (let notificationCounter = 0; notificationCounter < data.length; notificationCounter++) {

        let newListItem = document.createElement('li');
        newListItem.className = "dropdown-item";
        newListItem.innerHTML = data[notificationCounter].name +' '+ '<button class="rounden-circle btn btn-danger">'+data[notificationCounter].count+'</button>';
        counter += data[notificationCounter].count;
        document.getElementById("admin-notification-dropdown-menu").appendChild(newListItem);
    }

    document.getElementById('admin-notification-dropdown-button').textContent = counter;

    if(counter !== 0){
        document.getElementById('admin-notification-dropdown').classList.remove('d-none');
    }




}

$(document).ready(function () {


    $.ajax({
        url: '/admin-notifications',
        success: function (response) {
            drawAdminNotificationDropdown(response);
        }
    });


});
