$(document).ready(function() {
    async function fetchSubsidiaryInformation() {
        try {
            return await $.ajax({
                url: '/api/subsidiaryInformation/load',
                type: 'GET',
            });
        } catch (error) {
            console.log("Error:", error);
            return "<option value=''>Error loading data</option>";
        }
    }

    (async () => {
        const options = await fetchSubsidiaryInformation();

        // 1. type별 리스트 분리
        const occupationList = options.filter(item => item.type === 'Occupation');
        const customerTypeList = options.filter(item => item.type === 'Customer Type');
        const purposeList = options.filter(item => item.type === 'Purpose of remittance');
        const relationList = options.filter(item => item.type === 'Relation to Beneficiary');
        const sourceOfIncomeList = options.filter(item => item.type === 'Source of Income');
        const sourceOfFundsList = sourceOfIncomeList.filter(item => item.partnerType === null);

        // 2. occupation, customer type, source of funds 입력
        SelectBoxByEnglish("#occupationSelect", occupationList, "#customerOccupation");
        // SelectBoxByEnglish("#occupationSelect", occupationList, "#occupation");
        SelectBoxByEnglish("#customerTypeSelect", customerTypeList, "#customerType");
        SelectBoxByEnglish("#sourceOfFundsSelect", sourceOfFundsList, "#customerSourceOfFunds");
        // SelectBoxByEnglish("#sourceOfFundsSelect", sourceOfFundsList, "#sourceOfFunds");

        let payoutPartnerType = $("#payoutPartnerSelect option:selected").data('type');
        setBasicTransactionInformation(payoutPartnerType, purposeList, relationList, sourceOfIncomeList);
        $("#payoutPartnerSelect").on("change", function() {
            payoutPartnerType = $("#payoutPartnerSelect option:selected").data('type');
            setBasicTransactionInformation(payoutPartnerType, purposeList, relationList, sourceOfIncomeList);
        });
        $("#customerTypeSelect").val($("#customerType").val());
    })();

    bindSelectToInput("occupationSelect", "customerOccupation");
    // bindSelectToInput("occupationSelect", "occupation");
    bindSelectToInput("customerTypeSelect", "customerType");
    bindSelectToInput("transactionReasonSelect", "transactionReason");
    bindSelectToInput("relationSelect", "relation");
    bindSelectToInput("incomeSourceSelect", "incomeSource");
    bindSelectToInput("sourceOfFundsSelect", "customerSourceOfFunds");
    // bindSelectToInput("sourceOfFundsSelect", "sourceOfFunds");

    function bindSelectToInput(selectId, inputId) {
        if (!$(`#${selectId}`)) {
            return;
        }

        $(`#${selectId}`).on("change", function () {
            $(`#${inputId}`).val($(this).val());
        });
    }
})