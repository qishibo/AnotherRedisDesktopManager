const tr = {
  message: {
    new_connection: 'Yeni Bağlantı',
    refresh_connection: 'Yenile',
    edit_connection: 'Bağlantıyı Düzenle',
    del_connection: 'Bağlantıyı Sil',
    close_connection: 'Bağlantıyı Kapat',
    add_new_line: 'Yeni Satır Ekle',
    redis_version: 'Redis Sürümü',
    process_id: 'Süreç Kimliği',
    used_memory: 'Kullanılan Bellek',
    used_memory_peak: 'Kullanılan Maksimum Bellek',
    used_memory_lua: 'Lua Tarafından Kullanılan Bellek',
    connected_clients: 'Bağlı İstemciler',
    total_connections_received: 'Toplam Bağlantı',
    total_commands_processed: 'Toplam Komut',
    key_statistics: 'Anahtar İstatistikleri',
    all_redis_info: 'Tüm Redis Bilgisi',
    server: 'Sunucu',
    memory: 'Bellek',
    stats: 'İstatistik',
    settings: 'Ayarlar',
    confirm_to_delete_row_data: 'Satır Verilerini Silmek İstiyor Musunuz?',
    delete_success: 'Silme Başarılı',
    delete_failed: 'Silme Başarısız',
    modify_success: 'Güncelleme Başarılı',
    modify_failed: 'Güncelleme Başarısız',
    add_success: 'Ekleme Başarılı',
    add_failed: 'Ekleme Başarısız',
    value_exists: 'Değer Mevcut',
    refresh_success: 'Yenileme Başarılı',
    click_enter_to_rename: 'Yeniden Adlandırmak için Tıklayın veya Enter Tuşuna Basın',
    click_enter_to_ttl: 'TTLyi Değiştirmek için Tıklayın veya Enter Tuşuna Basın',
    confirm_to_delete_key: '{key} Anahtarı Silinsin mi?',
    confirm_to_rename_key: 'Yeniden Adlandır {old} -> {new} ?',
    edit_line: 'Satırı Düzenle',
    auto_refresh: 'Otomatik Yenile',
    auto_refresh_tip: 'Otomatik Yenileme, Her {interval} Saniyede Otomatik Yenile',
    key_not_exists: 'Anahtar Mevcut Değil',
    collapse_all: 'Hepsini Daralt',
    expand_all: 'Hepsini Genişlet',
    json_format_failed: 'Json Ayrıştırma Başarısız Oldu',
    msgpack_format_failed: 'Msgpack Ayrıştırma Başarısız Oldu',
    php_unserialize_format_failed: 'PHP Serileştirmesi Başarısız Oldu',
    clean_up: 'Temizle',
    redis_console: 'Redis Konsolu',
    confirm_to_delete_connection: 'Bağlantıyı Silmeyi Onayla ?',
    connection_exists: 'Bağlantı Yapılandırması Zaten Var',
    close_to_edit_connection: 'Düzenlemeden Önce Bağlantıyı Kapatmalısınız',
    close_to_connection: 'Bağlantıyı Kapatmayı Onayla ?',
    ttl_delete: 'TTL Ayarı <= 0 Olan Anahtarlar Doğrudan Silinecek',
    max_page_reached: 'Maks. Sayfaya Ulaşıldı',
    add_new_key: 'Yeni Anahtar',
    enter_new_key: 'Önce Yeni Anahtarın Adını Girin',
    key_type: 'Anahtar Tipi',
    save: 'Kaydet',
    enter_to_search: 'Aramak Yapmak İçin',
    export_success: 'Dışa Aktarma Başarılı',
    select_import_file: 'Dosyayı Seçin',
    import_success: 'İçe Aktarma Başarılı',
    put_file_here: 'Dosyayı Buraya Sürükle veya Seç',
    config_connections: 'Bağlantılar',
    import: 'İçe Aktar',
    export: 'Dışa Aktar',
    open: 'Aç',
    close: 'Kapat',
    open_new_tab: 'Yeni Sekmede Aç',
    exact_search: 'Detaylı Arama',
    enter_to_exec: 'Komutları Yürütmek için Enter, Geçmişi Değiştirmek için Yukarı ve Aşağı Tuşlarına Basın',
    pre_version: 'Sürüm',
    manual_update: 'Manuel İndirme',
    retry_too_many_times: 'Yeniden Bağlanmak İçin Çok Fazla Deneme Yapıldı. Lütfen Sunucu Durumunu Kontrol Edin',
    key_to_search: 'Anahtar Kelime Araması',
    begin_update: 'Güncelle',
    ignore_this_version: 'Bu sürümü yok sayın',
    check_update: 'Güncellemeleri Denetle',
    update_checking: 'Güncellemeler Kontrol Ediliyor, Birkaç Dakika Bekleyin ...',
    update_available: 'Yeni Sürüm Bulundu',
    update_not_available: 'Uygulamanız Güncel',
    update_error: 'Güncelleştirme Başarısız',
    update_downloading: 'İndiriliyor...',
    update_download_progress: 'İndirme Durumu',
    update_downloaded: 'Güncelleme İndirme Tamamlandı, Lütfen Uygulamanızı Yeniden Başlatın.\
    [Tips]: Windows kullanıyorsanız, uygulamayı kapattıktan sonra masaüstü simgesinin normal duruma (yaklaşık 10 saniye) dönmesini bekleyin ve ardından yeniden açabilirsiniz',
    mac_not_support_auto_update: 'Mac Otomatik Güncellemeyi Desteklemez, Lütfen Manuel Olarak <a href="https://github.com/qishibo/AnotherRedisDesktopManager/releases">İndirin</a> ve Yükleyin,\
    veya Yükleme Komutunu Çalıştırın "brew reinstall --cask another-redis-desktop-manager"\
    <br><br>🧡sizin için yararlı olursa, <a href="https://apps.apple.com/app/id1516451072">AppStore</a> üzerinden sponsor olabilirsiniz ve AppStore sizin için otomatik olarak güncelleyecektir.',
    font_family: 'Yazı Tipi Ailesi',
    font_faq_title: 'Yazı Tipi Ayar Talimatları',
    font_faq: '1. Birden fazla yazı tipi ayarlanabilir<br>\
    2. Yazı tipi seçimi düzenli. Önce İngilizce yazı tipini sonra da kendi dilinizde yazı tipini seçmeniz önerilir<br>\
    3. Bazı istisna durumlarda sistem yazı tipi listesi yüklenemediğinde, yüklü yazı tipi adını manuel girebilirsiniz.',
    private_key_faq: '<pre>-----BEGIN RSA PRIVATE KEY-----</pre> ile başlayan RSA formatlı özel anahtar desteklenir\
    <pre>-----BEGIN OPENSSH PRIVATE KEY-----</pre> ile başlayalım, <pre>ssh-keygen -p -m pem -f ~/.ssh/id_rsa</pre> ile formatı dönüştürmeniz gerekiyor. Bu işlem önceki özel anahtar girişini etkilemez',
    dark_mode: 'Siyah Tema',
    load_more_keys: 'devamını yükle',
    key_name: 'Anahtar Adı',
    project_home: 'Proje Ana Sayfası',
    cluster_faq: 'Doldurmak için, kümedeki herhangi bir düğümü seçin, diğer düğümler otomatik olarak tanımlanacaktır.',
    redis_status: 'Redis Bilgisi',
    confirm_flush_db: 'Db {db} içindeki tüm anahtarları silmek istiyor musunuz?',
    flushdb: 'Veritabanını Temizle',
    flushdb_prompt: 'Giriş "{txt}"',
    info_disabled: 'Bilgi komutu yürütme istisnası (devre dışı bırakılmış olabilir), yeniden bilgi gösterilemiyor',
    page_zoom: 'Sayfa Yakınlaştırma',
    scan_disabled: 'Tarama komutu yürütme istisnası (devre dışı bırakılmış olabilir), anahtar listesi görüntülenemiyor',
    key_type_not_support: 'Görsel görüntüler bu tür için desteklenmiyor. Lütfen konsolu kullanın',
    delete_folder: 'Tüm Klasörü Tara ve Sil',
    multiple_select: 'Çoklu Seçim',
    copy: 'Kopyala',
    copy_success: 'Başarıyla kopyalayın',
    keys_to_be_deleted: 'Silinecek Anahtarlar',
    delete_all: 'Hepsini sil',
    clear_cache: 'Önbelleği Temizle',
    mark_color: 'Mark rengi',
    key_no_permission: 'Dosya okuma izninin süresi doldu, lütfen anahtar dosyasını manuel olarak yeniden seçin',
    toggle_check_all: 'Tümünü seç | Seçimini kaldır',
    select_lang: 'Dil Seçin',
    clear_cache_tip: 'İstemcide bir sorun olduğunda, bu işlem istemciyi geri yüklemek için tüm bağlantıları ve yapılandırmaları silecektir',
    detail: 'Detay',
    separator_tip: 'Ağaç görünümünün ayırıcısı, ağacı devre dışı bırakmak için boş olarak ayarlanır ve anahtarları liste olarak görüntüler',
    confirm_modify_unvisible_content: 'İçerik görünmez karakterler içeriyor, "Hex View" içinde güvenle düzenleyebilirsiniz. "Text View" de düzenlemeye devam etmek kodlama hatalarına neden oluyorsa, devam edeceğinizden emin misiniz?',
    keys_per_loading: 'Anahtar Sayısı',
    keys_per_loading_tip: 'Her seferinde yüklenen anahtar sayısı. Çok büyük ayarlamak performansı etkileyebilir',
    host: 'Adres',
    port: 'Liman',
    username: 'Kullanıcı adı',
    password: 'Parola',
    connection_name: 'Özel ad',
    separator: 'Ayırıcı',
    timeout: 'Zaman aşımı',
    private_key: 'Özel anahtar',
    public_key: 'Genel anahtar',
    authority: 'Yetki',
    redis_node_password: 'Redis düğüm şifresi',
    master_group_name: 'Master Grubunun Adı',
    command_log: 'Günlük',
    sentinel_faq: 'Birden fazla nöbetçiden birini seçebilirsiniz. Lütfen adres, bağlantı noktası ve parola için sentinel yapılandırmasını doldurun. Redis düğüm parolası, nöbetçi tarafından izlenen Ana düğümün parolasıdır.',
    hotkey: 'Kısayol Tuşu',
    persist: 'Bitiş Süresini Kaldır',
    custom_formatter: 'Biçimlendirici',
    custom_add_formatter: 'Biçimlendirici ekle',
    custom_edit_formatter: 'Biçimlendiriciyi düzenle',
    edit: 'Düzenle',
    delete: 'Sil',
    new: 'yeni',
  },
};

export default tr;
