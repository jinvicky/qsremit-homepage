$(document).ready(function() {
    /**
     * 서버로부터 국가 데이터를 비동기로 가져와 `<option>` 태그 목록을 생성하는 함수.
     * 국가 데이터를 기반으로 생성된 `<option>` 태그 문자열 반환.
     */
    async function fetchCountryOptions() {
        try {
            const response = await $.ajax({
                url: '/api/country/load',
                type: 'GET',
            });

            let countryOptions = "<option value=''>Select</option>";
            response.forEach(item => {
                countryOptions += `<option value="${item.id}">${item.name}</option>`;
            });

            return countryOptions;
        } catch (error) {
            console.log("Error:", error);
            return "<option value=''>Error loading data</option>";
        }
    }

    (async () => {
        const options = await fetchCountryOptions();
        // changeOptions("#senderCountry", "#senderCountrySelect", options);
        changeOptions("#nationality", "#nationalitySelect", options);
        changeOptions("#customerSenderCountry", "#senderCountrySelect", options);
        changeOptions("#nationality", "#senderNationalitySelect", options);
        changeOptions("#customerNationality", "#senderNationalitySelect", options);
        changeOptions("#beneficiaryNationality", "#beneficiaryNationalitySelect", options);
        changeOptions("#registrationCountry", "#registrationCountrySelect", options);
        changeOptions("#organizationType", "#organizationTypeSelect", options);
        changeOptions("#lawsonAccountNationality", "#lawsonAccountNationalitySelect", options);
        changeOptions("#inboundCountry", "#inboundCountrySelect", options);

        $("#senderCountrySelect").val("119"); // JAPAN 코드 119
        $("#customerSenderCountry").val("119");
        $("#senderCountry").val("119");
    })();

    function changeOptions(inputId, selectId, options) {
        const inputValue = $(inputId).val();

        $(selectId).html(options);

        if (inputValue) {
            $(selectId).val(inputValue);
        }

        $(selectId).on("change", function () {
            const selectedValue = $(this).val();
            if ($(inputId).val() !== selectedValue) {
                $(inputId).val(selectedValue);
            }
        });

        $(selectId).trigger('change');
    }
})