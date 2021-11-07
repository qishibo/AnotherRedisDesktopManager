const en = {
  message: {
    new_connection: 'New Connection',
    refresh_connection: 'Refresh',
    edit_connection: 'Edit Connection',
    del_connection: 'Delete Connection',
    close_connection: 'Close Connection',
    add_new_line: 'Add New Line',
    redis_version: 'Redis Version',
    process_id: 'Process ID',
    used_memory: 'Used Memory',
    used_memory_peak: 'Used Memory Peak',
    used_memory_lua: 'Used Memory Lua',
    connected_clients: 'Connected Clients',
    total_connections_received: 'Total Connections',
    total_commands_processed: 'Total Commands',
    key_statistics: 'Key Statistics',
    all_redis_info: 'All Redis Info',
    server: 'Server',
    memory: 'Memory',
    stats: 'Stats',
    settings: 'Settings',
    confirm_to_delete_row_data: 'Confirm To Delete The Row Data?',
    delete_success: 'Delete Success',
    delete_failed: 'Delete Failed',
    modify_success: 'Modify Success',
    modify_failed: 'Modify Failed',
    add_success: 'Add Success',
    add_failed: 'Add Failed',
    value_exists: 'Value Exists',
    refresh_success: 'Refresh Success',
    click_enter_to_rename: 'Click Or Press Enter To Rename',
    click_enter_to_ttl: 'Click Or Press Enter To Modify TTL',
    confirm_to_delete_key: 'Confirm To Delete {key} ?',
    confirm_to_rename_key: 'Confirm To Rename {old} -> {new} ?',
    edit_line: 'Edit Line',
    auto_refresh: 'Auto Refresh',
    auto_refresh_tip: 'Auto Refresh Switch, Refresh Every {interval} Seconds',
    key_not_exists: 'Key Not Exists',
    collapse_all: 'Collapse All',
    expand_all: 'Expand All',
    json_format_failed: 'Json Parse Failed',
    msgpack_format_failed: 'Msgpack Parse Failed',
    php_unserialize_format_failed: 'PHP Unserialize Failed',
    clean_up: 'Clean Up',
    redis_console: 'Redis Console',
    confirm_to_delete_connection: 'Confirm To Delete Connection ?',
    connection_exists: 'Connection Config Already Exists',
    close_to_edit_connection: 'You Must Close The Connection Before Editing',
    close_to_connection: 'Confirm To Close Connection ?',
    ttl_delete: 'Set TTL<=0 Will Delete The Key Directly',
    max_page_reached: 'Max Page Reached',
    add_new_key: 'New Key',
    enter_new_key: 'Enter Your New Key Name First',
    key_type: 'Key Type',
    save: 'Save',
    enter_to_search: 'Enter To Search',
    export_success: 'Export Success',
    select_import_file: 'Select The File',
    import_success: 'Import Success',
    put_file_here: 'Drag File Here Or Click To Select',
    config_connections: 'Connections',
    import: 'Import',
    export: 'Export',
    open: 'Open',
    close: 'Close',
    open_new_tab: 'Open In New Tab',
    exact_search: 'Exact Search',
    enter_to_exec: 'Press Enter To Exec Commands, Up and Down To Switch History',
    pre_version: 'Version',
    manual_update: 'Manual Download',
    retry_too_many_times: 'Too Many Attempts To Reconnect. Please Check The Server Status',
    key_to_search: 'Keyword Search',
    begin_update: 'Update',
    ignore_this_version: 'Ignore this version',
    check_update: 'Check Update',
    update_checking: 'Checking For Updates, Wait A Moment...',
    update_available: 'New Version Found',
    update_not_available: 'Your version is up to date',
    update_error: 'Update Failed',
    update_downloading: 'Downloading...',
    update_download_progress: 'Download Progress',
    update_downloaded: 'Update Download Completed, Restart Your App Please.\
    [Tips]: If you are using Windows, after closing the app, waiting the desktop icon to refresh to a normal state(about 10 seconds), and then you can reopen it',
    mac_not_support_auto_update: 'Mac Does Not Support Automatic Update, Please Manually <a href="https://github.com/qishibo/AnotherRedisDesktopManager/releases">Download</a> And Reinstall,\
    Or Run "brew reinstall --cask another-redis-desktop-manager"\
    <br><br>🧡if it\'s useful to you ,you can sponsor through <a href="https://apps.apple.com/app/id1516451072">AppStore</a>, and AppStore will automatically update it for you.',
    font_family: 'Font Family',
    font_faq_title: 'Font Setting Instructions',
    font_faq: '1. Multiple fonts can be set<br>\
    2. Font selection is orderly. It is suggested to choose English font first and then font in your language<br>\
    3. When the system font list cannot be loaded in some exceptional cases, you can enter the installed font name manually.',
    private_key_faq: 'RSA format private key is supported, which starts with <pre>-----BEGIN RSA PRIVATE KEY-----</pre>\
    as to starts with<pre>-----BEGIN OPENSSH PRIVATE KEY-----</pre>you need to convert format via <pre>ssh-keygen -p -m pem -f ~/.ssh/id_rsa</pre>This operation will not affect the previous private key login',
    dark_mode: 'Dark Mode',
    load_more_keys: 'load more',
    key_name: 'Key Name',
    project_home: 'Project Home',
    cluster_faq: 'Select any node in the cluster to fill in, and other nodes will be identified automatically.',
    redis_status: 'Redis Info',
    confirm_flush_db: 'Confirm to delete all the keys in db{db} ?',
    flushdb: 'Flush DB',
    flushdb_prompt: 'Input "{txt}"',
    info_disabled: 'Info command execution exception(may have been disabled), redis info cannot be displayed',
    page_zoom: 'Page Zoom',
    scan_disabled: 'Scan command execution exception(may have been disabled), key list cannot be displayed',
    key_type_not_support: 'Visual display is not supported for this type. Please use console',
    delete_folder: 'Scan And Delete Whole Folder',
    multiple_select: 'Multiple Select',
    copy: 'Copy',
    copy_success: 'Copy success',
    keys_to_be_deleted: 'Keys To Be Deleted',
    delete_all: 'Delete All',
    clear_cache: 'Clear Cache',
    mark_color: 'Mark Color',
    key_no_permission: 'File read permission has expired, please reselect the key file manually',
    toggle_check_all: 'Select all | Unselect all',
    select_lang: 'Select Language',
    clear_cache_tip: 'When there is a problem with the client, this operation will delete all the connections and configurations to recover the client',
    detail: 'Detail',
    separator_tip: 'The separator of the tree view, set to empty to disable tree and display keys as list',
    confirm_modify_unvisible_content: 'The content contains invisible characters, you can edit safely in the "Hex View". If continuing to edit in the "Text View" may cause coding errors, sure to continue?',
    keys_per_loading: 'Load Number',
    keys_per_loading_tip: 'The number of keys loaded each time. Setting too large may affect performance',
    host: 'Host',
    port: 'Port',
    username: 'Username',
    password: 'Password',
    connection_name: 'Connection Name',
    separator: 'Separator',
    timeout: 'Timeout',
    private_key: 'Private Key',
    public_key: 'Public Key',
    authority: 'Authority',
    redis_node_password: 'Redis Node Password',
    master_group_name: 'Master Group Name',
    command_log: 'Log',
    sentinel_faq: 'You can choose one of multiple sentinels. Please fill in the sentinel configuration for the address, port and password. The Redis node password is the password of the Master node monitored by the sentinel.',
    hotkey: 'Hot Key',
    persist: 'Remove Expire Time',
    custom_formatter: 'Custom Formatter',
    edit: 'Edit',
    new: 'New',
    custom: 'Customize',
    hide_window: 'Hide Window',
    minimize_window: 'Minimize window',
    maximize_window: 'Maximize window',
    load_all_keys: 'load all',
    can_load_all_keys: 'Enable button to load all keys',
  },
};

export default en;
