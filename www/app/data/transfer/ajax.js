var mGtiDataTransferAjax = {

  beforeSendAuthorizationHeader:function (request) {
    var authHeader = mGtiApplication.Objects.get("settings").get("username") + ":" + mGtiApplication.Objects.get("settings").get("password");
    authHeader = "Basic " + btoa(authHeader);
    request.setRequestHeader('Authorization', authHeader);
  }
}