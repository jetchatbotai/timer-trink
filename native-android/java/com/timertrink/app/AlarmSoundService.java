package com.timertrink.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class AlarmSoundService extends Service {

    public static final String CHANNEL_ID = "alarm_service_channel";
    public static final int NOTIFICATION_ID = 7001;

    private MediaPlayer mediaPlayer;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        String title = "Süre doldu!";
        String message = "Alarm çalıyor";
        String soundName = "beep"; // default

        if (intent != null) {
            if (intent.getStringExtra("title") != null)
                title = intent.getStringExtra("title");

            if (intent.getStringExtra("message") != null)
                message = intent.getStringExtra("message");

            if (intent.getStringExtra("soundName") != null)
                soundName = intent.getStringExtra("soundName");
        }

        // 🔥 STOP ACTION
        Intent stopIntent = new Intent(this, AlarmStopReceiver.class);
        PendingIntent stopPendingIntent = PendingIntent.getBroadcast(
                this,
                9001,
                stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // 🔥 NOTIFICATION
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(message)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setOngoing(true)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .addAction(0, "Kapat", stopPendingIntent)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        // 🔥 SES BAŞLAT
        startAlarmLoop(soundName);

        return START_STICKY;
    }

    private void startAlarmLoop(String soundName) {
        stopAlarmLoop();

        try {
            int soundId = getResources().getIdentifier(soundName, "raw", getPackageName());

            if (soundId == 0) {
                soundId = getResources().getIdentifier("beep", "raw", getPackageName());
            }

            mediaPlayer = new MediaPlayer();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mediaPlayer.setAudioAttributes(
                        new AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_ALARM)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build()
                );
            }

            mediaPlayer.setDataSource(this,
                    android.net.Uri.parse("android.resource://" + getPackageName() + "/" + soundId));

            mediaPlayer.setLooping(true);
            mediaPlayer.setVolume(1f, 1f);
            mediaPlayer.prepare();
            mediaPlayer.start();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void stopAlarmLoop() {
        try {
            if (mediaPlayer != null) {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
            }
        } catch (Exception ignored) {
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Alarm Service",
                    NotificationManager.IMPORTANCE_HIGH
            );

            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            manager.createNotificationChannel(channel);
        }
    }

    @Override
    public void onDestroy() {
        stopAlarmLoop();
        stopForeground(true);
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
