// app.controller(
//   "LoginController",
//   function ($scope, $http, $rootScope, $location) {
//     $scope.isLoggedIn = false; // Ban đầu đặt là chưa đăng nhập
//     $scope.user = {}; // Khởi tạo đối tượng người dùng

//     // Hàm parse JWT để giải mã token và lấy thông tin người dùng
//     function parseJwt(token) {
//       const base64Url = token.split(".")[1];
//       const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//       return JSON.parse(atob(base64));
//     }

//     // Hàm login
//     $scope.login = function () {
//       if (!$scope.user.username || !$scope.user.password) {
//         Swal.fire({
//           icon: "error",
//           title: "Lỗi!",
//           text: "Vui lòng điền đầy đủ thông tin đăng nhập.",
//           confirmButtonText: "OK",
//         });
//         return;
//       }

//       // Gửi yêu cầu HTTP để xác thực người dùng
//       $http
//         .post("http://160.30.21.47:1234/api/user/authenticate", {
//           username: $scope.user.username,
//           password: $scope.user.password,
//         })
//         .then(
//           function success(response) {
//             const token = response.data.token;
//             if (token) {
//               const userInfo = parseJwt(token);

//               // Kiểm tra nếu người dùng là Admin thì mới cho phép đăng nhập
//               if (userInfo.role === "Admin") {
//                 // Lưu token và thông tin người dùng
//                 localStorage.setItem("authToken", token);
//                 localStorage.setItem("userInfo", JSON.stringify(userInfo));
//                 $scope.isLoggedIn = true;
//                 $rootScope.isLoggedIn = true;

//                 Swal.fire({
//                   icon: "success",
//                   title: "Thành công!",
//                   text: "Đăng nhập thành công! Chào mừng Admin.",
//                   confirmButtonText: "OK",
//                   timer: 3000,
//                 }).then(() => {
//                   $location.path("/home"); // Điều hướng tới trang home trong ứng dụng
//                   $scope.$apply(); // Cập nhật điều hướng sau khi gọi từ hàm callback
//                 });
//               } else {
//                 // Thông báo từ chối quyền truy cập cho người dùng không phải là Admin
//                 Swal.fire({
//                   icon: "error",
//                   title: "Quyền truy cập bị từ chối",
//                   text: "Bạn không có quyền truy cập vào trang này.",
//                   confirmButtonText: "OK",
//                 });
//               }
//             } else {
//               // Thông báo khi không có token trả về
//               Swal.fire({
//                 icon: "error",
//                 title: "Lỗi!",
//                 text: "Đăng nhập thất bại. Vui lòng thử lại.",
//                 confirmButtonText: "OK",
//               });
//             }
//           },
//           function error(response) {
//             let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
//             if (response.status === 401) {
//               errorMessage =
//                 response.data.error ||
//                 "Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra và thử lại.";
//             }

//             Swal.fire({
//               icon: "error",
//               title: "Lỗi!",
//               text: errorMessage,
//               confirmButtonText: "OK",
//             });
//           }
//         );
//     };

//     // Hàm đăng xuất
//     $scope.logout = function () {
//       localStorage.removeItem("authToken");
//       localStorage.removeItem("userInfo");
//       $scope.isLoggedIn = false;
//       $rootScope.isLoggedIn = false;

//       Swal.fire({
//         icon: "info",
//         title: "Đăng xuất thành công!",
//         text: "Bạn đã đăng xuất khỏi tài khoản.",
//         confirmButtonText: "OK",
//         timer: 3000,
//       }).then(() => {
//         $location.path("/login"); // Điều hướng về trang đăng nhập trong ứng dụng
//         $scope.$apply(); // Cập nhật điều hướng sau khi gọi từ hàm callback
//       });
//     };
//   }
// );
