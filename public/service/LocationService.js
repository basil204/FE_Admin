app.service('LocationService', function ($http) {
    const baseUrl = "https://api.goship.io/api/";
    const tokenAddress =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImEzYWYyMzZjY2YxNzhjMzMwMTliZWRiNmY0NzVhMWQxZDMzMzE1NmE0N2U1YWFiNDA2NmFmOTE2MDc0MDdlMWNiYTY3ZDc1YjFiZWU5MDUyIn0.eyJhdWQiOiI3NyIsImp0aSI6ImEzYWYyMzZjY2YxNzhjMzMwMTliZWRiNmY0NzVhMWQxZDMzMzE1NmE0N2U1YWFiNDA2NmFmOTE2MDc0MDdlMWNiYTY3ZDc1YjFiZWU5MDUyIiwiaWF0IjoxNzMzNzcxODgxLCJuYmYiOjE3MzM3NzE4ODEsImV4cCI6MjA0OTMwNDY4MSwic3ViIjoiMzc4MCIsInNjb3BlcyI6W119.LY_gpwvPCnemap1JkpzwW6625Vd-Q_K8kc3nmJudacMj2XXsSHj_mDN-IfxwrRJiCcFHxgVyywcEIbpXuucLLIzXxCDrRKxMm4B1t4vLsN5pWf3d82FMH8Bxbtd0xRgmYSNh-XKhz1cCmOYXAhpfzvjDjY28R0vI2pGvESrYZAvnoAhwLAg7WAkQ4V5tsj0QHn4lWYQXTHgwlPDODBylxM2WikJw-OXW4dEX3JGn1ns5yF55Kgz7-vI3FXMyLwJ2uBWg_jMtJPj4SjSotkhjZwsbDNJrttNHv7Xkkeow29XnjysD7obEnCqkcy3xlYdz30X5bNzsJP7gqOy3AKPxDQeTMTAV42iGsLWfLLlQTG3gXIhixoZChq9w35K_O5OCx7PiqFADduAxtuVge0gBLH6XIdz1QBr_yUqvszmyMI0IWWtcSprbf-s8PJ4FtyhLNKeN5fidmes-mpV4Pmonk_DsuVhdPazlkmv8IO-DUbvo6CsqHnikeV_v_xPrhIsOwnsC8ISeMNQOkT_fMKEZvQzgGrL56NnJ0Av-FPVXaNNAkf6uWILsg_Ye9gWKUgb_Acr_XfVHB4GzFdtXEmsbMOCS4fWv_CHOzBmCMjHp8aWaInIBfxGzdLRjnF3hToaV7_O02illQtZa7mXLHlUz6lRTcmaP73FH1Wm3xSf1qtQ";
    const config = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenAddress}`,
        },
    };
    this.findById = function (items, id) {
        return items.find(item => item.id === id);
    };
    this.getCities = function () {
        return $http.get(baseUrl + "v2/cities", config);
    };

    this.getDistricts = function (cityId) {
        return $http.get(baseUrl + "v2/cities/" + cityId + "/districts", config);
    };

    this.getWards = function (districtCode) {
        return $http.get(baseUrl + "v1/wards?district_code=" + districtCode, config);
    };
});