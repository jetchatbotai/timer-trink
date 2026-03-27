package com.timertrink.app;

import android.app.Activity;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.content.Context;

public class AlarmActivity extends Activity {

    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private boolean isStopping = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        setContentView(createLayout());
        startAlarm();
    }

    private void startAlarm() {
        try {
            String soundName = getIntent() != null
                    ? getIntent().getStringExtra("soundName")
                    : null;

            if (soundName == null || soundName.trim().isEmpty()) {
                soundName = "beep";
            }

            int soundId = getResources().getIdentifier(soundName, "raw", getPackageName());
            if (soundId == 0) {
                soundId = getResources().getIdentifier("beep", "raw", getPackageName());
            }

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(
                    new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
            );

            mediaPlayer.setDataSource(this,
                    android.net.Uri.parse("android.resource://" + getPackageName() + "/" + soundId));
            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();
            mediaPlayer.start();

        } catch (Exception e) {
            e.printStackTrace();
            tryFallbackBeep();
        }

        try {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = new long[]{0, 500, 300, 700, 300, 700};

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
                } else {
                    vibrator.vibrate(pattern, 0);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void tryFallbackBeep() {
        try {
            int soundId = getResources().getIdentifier("beep", "raw", getPackageName());
            if (soundId == 0) return;

            mediaPlayer = MediaPlayer.create(this, soundId);
            if (mediaPlayer != null) {
                mediaPlayer.setLooping(true);
                mediaPlayer.start();
            }
        } catch (Exception ignored) {
        }
    }

    private void stopAlarmAndClose() {
        if (isStopping) return;
        isStopping = true;

        try {
            if (mediaPlayer != null) {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            if (vibrator != null) {
                vibrator.cancel();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        finish();
    }

    private View createLayout() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(50, 200, 50, 200);
        layout.setGravity(Gravity.CENTER);
        layout.setBackgroundColor(0xFF111111);

        TextView title = new TextView(this);
        title.setText("⏰ SÜRE DOLDU");
        title.setTextSize(28);
        title.setTextColor(0xFFFFFFFF);
        title.setGravity(Gravity.CENTER);

        TextView desc = new TextView(this);
        desc.setText("Alarm çalıyor\nDurdurmak için bas");
        desc.setTextSize(18);
        desc.setTextColor(0xFFFFFFFF);
        desc.setGravity(Gravity.CENTER);

        Button stopBtn = new Button(this);
        stopBtn.setText("DURDUR");
        stopBtn.setTextSize(20);
        stopBtn.setOnClickListener(v -> stopAlarmAndClose());

        layout.addView(title);
        layout.addView(desc);
        layout.addView(stopBtn);

        return layout;
    }

    @Override
    public void onBackPressed() {
        stopAlarmAndClose();
    }

    @Override
    protected void onDestroy() {
        if (!isStopping) {
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

            try {
                if (vibrator != null) {
                    vibrator.cancel();
                }
            } catch (Exception ignored) {
            }
        }
        super.onDestroy();
    }
}
