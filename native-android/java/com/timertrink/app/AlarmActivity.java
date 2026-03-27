package com.timertrink.app;

import android.app.Activity;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.content.Context;

public class AlarmActivity extends Activity {

    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 🔥 KİLİT EKRANI ÜSTÜNE ÇIK
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        setContentView(createLayout());

        startAlarm();
    }

    private void startAlarm() {
        try {
            // 🔊 SES (res/raw/beep.mp3)
            int soundId = getResources().getIdentifier("beep", "raw", getPackageName());
            mediaPlayer = MediaPlayer.create(this, soundId);
            mediaPlayer.setLooping(true);
            mediaPlayer.start();

            // 📳 TİTREŞİM
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

            if (vibrator != null) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(
                            new long[]{0, 500, 500},
                            0
                    ));
                } else {
                    vibrator.vibrate(new long[]{0, 500, 500}, 0);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void stopAlarm() {
        try {
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.release();
                mediaPlayer = null;
            }

            if (vibrator != null) {
                vibrator.cancel();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        finish();
    }

    private android.view.View createLayout() {

        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(50, 200, 50, 200);
        layout.setGravity(android.view.Gravity.CENTER);

        TextView title = new TextView(this);
        title.setText("⏰ SÜRE DOLDU");
        title.setTextSize(28);
        title.setGravity(android.view.Gravity.CENTER);

        TextView desc = new TextView(this);
        desc.setText("Alarm çalıyor\nDurdurmak için bas");
        desc.setTextSize(18);
        desc.setGravity(android.view.Gravity.CENTER);

        Button stopBtn = new Button(this);
        stopBtn.setText("DURDUR");
        stopBtn.setTextSize(20);

        stopBtn.setOnClickListener(v -> stopAlarm());

        layout.addView(title);
        layout.addView(desc);
        layout.addView(stopBtn);

        return layout;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopAlarm();
    }
}
