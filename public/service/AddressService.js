app.service('AddressService', function () {
    this.concatAddress = function (tinh, quan, phuong, detail) {
        // Gộp các phần của địa chỉ thành một chuỗi
        let address = `${tinh.name}, ${quan.name}, ${phuong.name}`;
        if (detail && detail.trim() !== "") {
            address += `, ${detail}`;
        }
        return address;
    };

    this.splitAddress = function (fullAddress) {
        // Tách địa chỉ thành các phần dựa vào ", "
        return fullAddress.split(", ").map(part => part.trim());
    };
});
