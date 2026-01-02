$.ajax({
    type: "GET",
    url: "/transaction/transactionOutboundHistorySend/formOptions",
    success: function (data) {
        sessionStorage.setItem("partnersCountry",  JSON.stringify(data.countryToPartners))
        SelectBox("#partnerNationality", Object.keys(data.countryToPartners), "#dpartnerNationalityInput", "Select the receiving country");
        SelectBoxByMap("#nationalitySelect", data.countries, "#nationality", "Select the nationality of the receiver");
        SelectBoxByMap("#transactionReason", data.purposeOfRemittances, "#transactionReasonInput", );
        SelectBoxByMap("#relation", data.relationToBeneficiaries, "#relationInput");
        SelectBoxByMap("#incomeSource", data.sourceOfIncomes, "#incomeSourceInput");
        SelectBoxByMap("#gmeReasons", data.gmeReasons, "#gmeReasonsInput");


    },
    error: function () {
        alert("**Failed to fetch data.");
    }
});

// SelectBox 초기화 함수
function SelectBox(selector, options, input, placeholder = 'Select') {
    $(selector).empty().append(`<option value="">${placeholder}</option>`);
    options.forEach(function (option) {
        $(selector).append(`<option ${$(input).val() === option ? 'selected' : ''} value="${option}">${option}</option>`);
    });
}

// SelectBox 초기화 함수 - value, option text 분리 사용
function SelectBoxByMap(selector, options, input, placeholder = 'Select') {
    $(selector).empty().append(`<option value="">${placeholder}</option>`);
    options.forEach(function (option) {
        $(selector).append(`<option ${$(input).val() === option.id ? 'selected' : ''} value="${option.id}">${option.name}</option>`);
    });
}
