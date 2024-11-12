var app = angular.module("myApp", ["ngRoute"]);
app.run(function ($rootScope, $location) {
  // Check if user is already logged in on app load
  const token = localStorage.getItem("authToken");
  if (token) {
    const userInfo = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (userInfo.role === "Admin") {
      $rootScope.isLoggedIn = true;
    } else {
      $rootScope.isLoggedIn = false;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
    }
  } else {
    $rootScope.isLoggedIn = false;
  }

  // Redirect to login if not authenticated and trying to access protected routes
  $rootScope.$on("$routeChangeStart", function (event, next) {
    if (next.resolve && !localStorage.getItem("authToken")) {
      $location.path("/login");
    }
  });
});
app.config(function ($routeProvider) {
  // Require authentication function that checks token from localStorage
  function requireAuth($location, $rootScope) {
    if (!localStorage.getItem("authToken")) {
      $location.path("/login");
    }
  }

  // Define routes with authentication requirements
  $routeProvider
    .when("/login", {
      templateUrl: "/views/login.html",
      controller: "LoginController",
    })
    .when("/home", {
      templateUrl: "/views/home.html",
      controller: "HomeController",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-don-hang", {
      templateUrl: "/views/form-add-don-hang.html",
      controller: "AddOrderController",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-nhan-vien", {
      templateUrl: "/views/form-add-nhan-vien.html",
      controller: "AddEmployeeController",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-san-pham", {
      templateUrl: "/views/form-add-san-pham.html",
      controller: "AddProductController",
      resolve: { auth: requireAuth },
    })
    .when("/quan-ly-bao-cao", {
      templateUrl: "/views/quan-ly-bao-cao.html",
      controller: "ReportManagementController",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-khach-hang", {
      templateUrl: "/views/table-data-khach-hang.html",
      controller: "CustomerDataController",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-oder", {
      templateUrl: "/views/table-data-oder.html",
      controller: "OrderDataController",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-product", {
      templateUrl: "/views/table-data-product.html",
      controller: "ProductDataController",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-table", {
      templateUrl: "/views/table-data-table.html",
      controller: "TableDataController",
      resolve: { auth: requireAuth },
    })
    .otherwise({
      redirectTo: "/home",
    });
});

// Login Controller with login and logout functions
