$(document).ready(function() {
    const checkPayoutTypeLoaded = setInterval(() => {
        const value = $("#payoutTypeSelect").val();
        if (value) {
            $("#payoutTypeSelect").trigger("change");
            clearInterval(checkPayoutTypeLoaded);
        }
    }, 100);
});