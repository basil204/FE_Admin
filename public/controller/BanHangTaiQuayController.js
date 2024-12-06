app.controller('BanHangTaiQuayController', ['$scope', '$location', function($scope, $location) {
    // Theo dõi URL hiện tại và xác định trang "ban-hang-tai-quay"
    $scope.isBanHangTaiQuayPage = $location.path() === '/ban-hang-tai-quay';

    // Lắng nghe sự kiện thay đổi URL
    $scope.$on('$routeChangeStart', function() {
        $scope.isBanHangTaiQuayPage = $location.path() === '/ban-hang-tai-quay';
    });
}]);
