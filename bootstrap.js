const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const self = this;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

const XHTML = Namespace("html", "http://www.w3.org/1999/xhtml");
const gSession = Cc["@mozilla.org/messenger/services/session;1"].getService(Ci.nsIMsgMailSession);
const FolderListenr = Ci.nsIFolderListener;
const window_name = "notifier:notify";
const CHROME_URL = "chrome://notifier/content/alert.xul";

function once(e, name, callback, capture) {
    capture = !!capture;
    function callback1(evt) {
        e.removeEventListener(name, callback1, capture);
        return callback.call(this, evt);
    }
    e.addEventListener(name, callback1, capture);
}
var listener = {
    OnItemAdded: function (parent, item) {
        if (item instanceof Ci.nsIMsgDBHdr && !item.isRead) {
            var win = Services.wm.getMostRecentWindow(window_name);
            if (win) {
                win.addMessage(item);
            } else {
                const features = "chrome,dialog=yes,titlebar=no,popup=yes";
                //const features = "chrome,dialog=yes,titlebar=no,popup=yes,alwaysRaised";
                win = Services.ww.openWindow(null, "chrome://notifier/content/alert.xul", window_name, features, null);
                win.screenX = 0x7fff;
                win.screenY = 0x7fff;
                once(win, "load", function () win.addMessage(item), true);
            }
        }
    },
};

function startup(data, reason) {
    var resHandler = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
    //resHandler.setSubstitution("notifier", Services.io.newURI("components/", null, data.resourceURI));

    Components.manager.addBootstrappedManifestLocation(data.installPath);
    gSession.AddFolderListener(listener, FolderListenr.added);
}

function shutdown(data, reason) {
    gSession.RemoveFolderListener(listener);
    var win = Services.wm.getMostRecentWindow(window_name);
    win && win.close();
}
function install(data, reason) {
}
function uninstall(data, reason) {
}
