export class Assets {
    public img: string[];
    public audioSfx: string[];
    public audioSfxLR: string[];
    public audioSfxLoud: string[];
    public fonts: {[id:string] : string};
    public views: string[];

    constructor() {
      this.img = [
        'title-screen.png',
        'notes.png',
        'notes_drumroll.png',
        'notes_hit.png',
        'notes_explosion.png',
        'balloon.png',
        'taiko.png',
        'dancing-don.gif',
        'bg-pattern-1.png',
        'difficulty.png',
        'don_anim_normal_a.png',
        'don_anim_normal_b1.png',
        'don_anim_normal_b2.png',
        'don_anim_10combo_a.png',
        'don_anim_10combo_b1.png',
        'don_anim_10combo_b2.png',
        'don_anim_gogo_a.png',
        'don_anim_gogo_b1.png',
        'don_anim_gogo_b2.png',
        'don_anim_gogostart_a.png',
        'don_anim_gogostart_b1.png',
        'don_anim_gogostart_b2.png',
        'don_anim_clear_a.png',
        'don_anim_clear_b1.png',
        'don_anim_clear_b2.png',
        'fire_anim.png',
        'fireworks_anim.png',
        'bg_genre_def.png',
        'bg_score_p1.png',
        'bg_score_p2.png',
        'bg_settings.png',
        'bg_pause.png',
        'badge_auto.png',
        'touch_pause.png',
        'touch_fullscreen.png',
        'mimizu.png',
        'results_flowers.png',
        'results_mikoshi.png',
        'results_tetsuohana.png',
        'results_tetsuohana2.png',
        'settings_gamepad.png'
      ];
    }
}
