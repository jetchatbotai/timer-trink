package com.timertrink.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
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

public class AlarmActivity extends Activity {

    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private boolean isStopping = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
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

            getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        setContentView(createLayout());
        startAlarmSafely();
    }

    private void startAlarmSafely() {
        stopMediaOnly();

        String soundName = "beep";
        try {
            if (getIntent() != null) {
                String incoming = getIntent().getStringExtra("soundName");
                if (incoming != null && !incoming.trim().isEmpty()) {
                    soundName = incoming.trim();
                }
            }
        } catch (Exception ignored) {
        }

        tryStartPlayer(soundName);
        startVibrationSafely();
    }

    private void tryStartPlayer(String soundName) {
        try {
            int soundId = getResources().getIdentifier(soundName, "raw", getPackageName());
            if (soundId == 0) {
                soundId = getResources().getIdentifier("beep", "raw", getPackageName());
            }

            if (soundId == 0) {
                return;
            }

            mediaPlayer = MediaPlayer.create(this, soundId);

            if (mediaPlayer == null) {
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mediaPlayer.setAudioAttributes(
                        new AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_ALARM)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build()
                );
            }

            mediaPlayer.setLooping(true);
            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                stopMediaOnly();
                return true;
            });

            mediaPlayer.start();

        } catch (Exception e) {
            e.printStackTrace();
            stopMediaOnly();
        }
    }

    private void startVibrationSafely() {
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

    private void stopMediaOnly() {
        try {
            if (mediaPlayer != null) {
                try {
                    if (mediaPlayer.isPlaying()) {
                        mediaPlayer.stop();
                    }
                } catch (Exception ignored) {
                }

                try {
                    mediaPlayer.reset();
                } catch (Exception ignored) {
                }

                try {
                    mediaPlayer.release();
                } catch (Exception ignored) {
                }

                mediaPlayer = null;
            }
        } catch (Exception ignored) {
        }
    }

    private void stopVibrationOnly() {
        try {
            if (vibrator != null) {
                vibrator.cancel();
            }
        } catch (Exception ignored) {
        }
    }

    private void stopAlarmAndClose() {
        if (isStopping) return;
        isStopping = true;

        stopMediaOnly();
        stopVibrationOnly();

        try {
            Intent stopIntent = new Intent(this, AlarmStopReceiver.class);
            stopIntent.setAction("com.timertrink.app.ACTION_STOP_ALARM");
            sendBroadcast(stopIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            finishAndRemoveTask();
        } catch (Exception e) {
            e.printStackTrace();
            finish();
        }
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
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    protected void onDestroy() {
        stopMediaOnly();
        stopVibrationOnly();
        super.onDestroy();
    }
}
