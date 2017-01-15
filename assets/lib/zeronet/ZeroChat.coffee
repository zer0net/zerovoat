class ZeroChat extends ZeroFrame

    selectUser: =>
        Page.cmd "certSelect", [["zeroid.bit", "zeroverse.bit"]]
        return false

    route: (cmd, message) ->
        console.log(cmd,message);
        if cmd == "setSiteInfo"
            @site_info = message.params  # Save site info data to allow access it later

    # Wrapper websocket connection ready
    onOpenWebsocket: (e) =>
        @cmd "siteInfo", {}, (site_info) =>
            @site_info = site_info  # Save site info data to allow access it later

window.Page = new ZeroChat()