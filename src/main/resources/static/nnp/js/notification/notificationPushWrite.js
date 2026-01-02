$(document).ready(function () {
    /**
     * csrf token
     * */
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    $.ajax({
        url: `/customer/nationalities`,
        type: "GET",
        success: function (response) {
            let options = '<option value="">Selected Nationality</option>'
            response.forEach(function (item) {
                options += `<option ${$("#nationality").val() === item.id ? 'Selected Nationality' : ''} value="${item.name}">${item.name}</option>`
            })
            $("#customerSearchNationalitySelect select").append(options);
        },
        error: function (xhr, status, error) {
            console.error("Error deleting Customer:", error);
            alert("Failed to delete the customer. Please try again.");
        }
    });
    $("#customerSearchNationalitySelect select").on("change", function () {
        $("#nationality").val($(this).val());
    })

    $("#saveButton").on("click", function (e) {
        e.preventDefault();
        const formData = $("#notificationPushForm").serialize();

        $.ajax({
            url: "/notification/pushWrite",
            type: "POST",
            data: formData,
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function () {
                alert("Push notification sent successfully.");
                deleteCurrentTab();
                window.location.href = "/notification/notificationPush";
            },
            error: function (xhr) {
                console.error("Error deleting Customer:", xhr.responseText);
                alert(xhr.responseText || "Failed to push notification. Please try again.");
            }
        });
    })

    const tabs = JSON.parse(sessionStorage.getItem("tabs")) || [];
    function deleteCurrentTab() {
        const currentUrl =  window.location.pathname.trim() + window.location.search.trim();
        const tabIndex = tabs.findIndex(tab => tab.url === currentUrl);

        if (tabIndex !== -1) {
            tabs.splice(tabIndex, 1);
            sessionStorage.setItem("tabs", JSON.stringify(tabs));
        }
    }
});