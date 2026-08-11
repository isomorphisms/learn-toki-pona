.class public Lorg/tokipona/drills/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"

.field private web_view:Landroid/webkit/WebView;

.method public constructor <init>()V
    .locals 0

    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 3

    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance v0, Landroid/webkit/WebView;

    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V

    iput-object v0, p0, Lorg/tokipona/drills/MainActivity;->web_view:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object v1

    const/4 v2, 0x1

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDatabaseEnabled(Z)V

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V

    const/4 v2, 0x0

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowUniversalAccessFromFileURLs(Z)V

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptCanOpenWindowsAutomatically(Z)V

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setSaveFormData(Z)V

    const/16 v2, 0x64

    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setTextZoom(I)V

    invoke-virtual {p0, v0}, Landroid/app/Activity;->setContentView(Landroid/view/View;)V

    const-string v1, "file:///android_asset/www/index.html"

    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    return-void
.end method

.method protected onPause()V
    .locals 1

    iget-object v0, p0, Lorg/tokipona/drills/MainActivity;->web_view:Landroid/webkit/WebView;

    if-eqz v0, :paused

    invoke-virtual {v0}, Landroid/webkit/WebView;->onPause()V

    :paused
    invoke-super {p0}, Landroid/app/Activity;->onPause()V

    return-void
.end method

.method protected onResume()V
    .locals 1

    invoke-super {p0}, Landroid/app/Activity;->onResume()V

    iget-object v0, p0, Lorg/tokipona/drills/MainActivity;->web_view:Landroid/webkit/WebView;

    if-eqz v0, :resumed

    invoke-virtual {v0}, Landroid/webkit/WebView;->onResume()V

    :resumed
    return-void
.end method

.method protected onDestroy()V
    .locals 1

    iget-object v0, p0, Lorg/tokipona/drills/MainActivity;->web_view:Landroid/webkit/WebView;

    if-eqz v0, :destroyed

    invoke-virtual {v0}, Landroid/webkit/WebView;->destroy()V

    const/4 v0, 0x0

    iput-object v0, p0, Lorg/tokipona/drills/MainActivity;->web_view:Landroid/webkit/WebView;

    :destroyed
    invoke-super {p0}, Landroid/app/Activity;->onDestroy()V

    return-void
.end method
