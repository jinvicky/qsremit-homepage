$(document).ready(function () {
    $("#resetPasswordForm").submit(function (event) {
        event.preventDefault();

        const formData = $(this).serialize();
        $.ajax({
            type: "POST",
            url: "/reset",
            data: formData,
            xhrFields: { withCredentials: true },
            beforeSend: function(){
                $('#loadingSpinner').show();
            },
            success: function (data) {
                console.log(data);
                alert("Reset password successfully! Email delivery may take up to 1-2 minutes. Please use the temporary password to log in.");
            },
            error: function () {
                alert("Reset password failed! Check your ID, Email and try again.");
            },
            complete: function () {
                $('#loadingSpinner').hide();
            }
        });
    });
})