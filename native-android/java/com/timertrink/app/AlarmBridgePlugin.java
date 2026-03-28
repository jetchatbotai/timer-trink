// SADECE EKLENEN KISIMLARI GÖSTERİYORUM (senin koduna EKLE)

import android.content.SharedPreferences;

// üstte class içine ekle
private static final String PREFS = "pomodoro_prefs";

// ===============================
// YENİ: POMODORO SAVE
// ===============================
public static void savePomodoroState(
        Context context,
        boolean enabled,
        String phase,
        int work,
        int brk,
        int cycle,
        long nextEnd
) {
    SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);

    prefs.edit()
            .putBoolean("enabled", enabled)
            .putString("phase", phase)
            .putInt("work", work)
            .putInt("break", brk)
            .putInt("cycle", cycle)
            .putLong("endAt", nextEnd)
            .apply();
}

// ===============================
// YENİ: GET
// ===============================
public static SharedPreferences getPomodoroPrefs(Context context) {
    return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
}
