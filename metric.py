import math

def calculate_metric_thread_dimensions(nominal_diameter, pitch):
    """
    Calculate all metric thread dimensions for bolt and nut manufacturing
    
    Args:
        nominal_diameter: Nominal diameter in mm (e.g., 10 for M10)
        pitch: Thread pitch in mm (e.g., 1.5)
    
    Returns:
        Dictionary with all calculated dimensions
    """
    
    # Fundamental triangle calculations
    # Basic height of fundamental triangle
    H = (math.sqrt(3) / 2) * pitch  # 0.866025 * pitch
    
    # Thread heights
    h3 = H / 8  # 1/8 of basic triangle height
    h = (5 * H) / 8  # 5/8 of basic triangle height (0.61343 * pitch)
    
    # Major diameter (nominal diameter)
    d = nominal_diameter
    D = nominal_diameter  # Same for internal thread (nut)
    
    # Pitch diameter
    d2 = d - (3 * H) / 4  # d - 0.64952 * pitch
    D2 = D - (3 * H) / 4  # Same calculation for nut
    
    # Minor diameter
    d1 = d - (5 * H) / 4  # d - 1.08253 * pitch
    D1 = D - H  # D - 0.86603 * pitch (for nut)
    
    # Core diameter (actual minor diameter for bolt)
    d3 = d1 - (H / 4)  # d1 - 0.21651 * pitch
    
    # Thread engagement calculations
    thread_engagement = 0.75 * H  # Minimum thread engagement
    
    # Bolt head dimensions (hex head)
    head_diameter = 1.5 * d  # Approximate head diameter
    head_height = 0.7 * d    # Approximate head height
    
    # Nut dimensions
    nut_width_across_flats = 1.5 * d  # Width across flats (standard)
    nut_width_across_corners = nut_width_across_flats / math.cos(math.radians(30))
    nut_height = 0.8 * d  # Standard nut height
    
    # Washer dimensions
    washer_inner_diameter = d + 0.3  # Slight clearance
    washer_outer_diameter = 2.2 * d  # Standard washer outer diameter
    washer_thickness = 0.15 * d      # Standard washer thickness
    
    # Thread tolerance calculations (6H/6g standard)
    # External thread (bolt) tolerances
    d_max = d
    d_min = d
    d2_max = d2 - 0.038  # Approximate for 6g
    d2_min = d2 - 0.038 - 0.125
    d1_max = d1
    d1_min = d1 - 0.25
    
    # Internal thread (nut) tolerances  
    D_min = D
    D_max = D + 0.5
    D2_min = D2
    D2_max = D2 + 0.125
    D1_min = D1
    D1_max = D1 + 0.25
    
    return {
        # Basic thread parameters
        'nominal_diameter': nominal_diameter,
        'pitch': pitch,
        'thread_designation': f"M{nominal_diameter}x{pitch}",
        
        # Fundamental triangle
        'basic_triangle_height_H': H,
        'thread_height_h': h,
        'thread_height_h3': h3,
        'thread_engagement': thread_engagement,
        
        # External thread (bolt) dimensions
        'external_major_diameter_d': d,
        'external_pitch_diameter_d2': d2,
        'external_minor_diameter_d1': d1,
        'external_core_diameter_d3': d3,
        
        # Internal thread (nut) dimensions
        'internal_major_diameter_D': D,
        'internal_pitch_diameter_D2': D2,
        'internal_minor_diameter_D1': D1,
        
        # Bolt head dimensions
        'bolt_head_diameter': head_diameter,
        'bolt_head_height': head_height,
        
        # Nut dimensions
        'nut_width_across_flats': nut_width_across_flats,
        'nut_width_across_corners': nut_width_across_corners,
        'nut_height': nut_height,
        
        # Washer dimensions
        'washer_inner_diameter': washer_inner_diameter,
        'washer_outer_diameter': washer_outer_diameter,
        'washer_thickness': washer_thickness,
        
        # Tolerances (6H/6g standard)
        'external_tolerances': {
            'd_max': d_max, 'd_min': d_min,
            'd2_max': d2_max, 'd2_min': d2_min,
            'd1_max': d1_max, 'd1_min': d1_min
        },
        'internal_tolerances': {
            'D_min': D_min, 'D_max': D_max,
            'D2_min': D2_min, 'D2_max': D2_max,
            'D1_min': D1_min, 'D1_max': D1_max
        }
    }

def print_metric_thread_report(dimensions):
    """Print a comprehensive report of all metric thread dimensions"""
    
    print("=" * 60)
    print(f"METRIC THREAD CALCULATION: {dimensions['thread_designation']}")
    print("=" * 60)
    
    print("\n📐 FUNDAMENTAL TRIANGLE:")
    print(f"  Basic triangle height (H):     {dimensions['basic_triangle_height_H']:.4f}")
    print(f"  Thread height (h):             {dimensions['thread_height_h']:.4f}")
    print(f"  Thread height (h₃):            {dimensions['thread_height_h3']:.4f}")
    print(f"  Thread engagement:             {dimensions['thread_engagement']:.4f}")
    
    print("\n🔩 EXTERNAL THREAD (BOLT):")
    print(f"  Major diameter (d):            {dimensions['external_major_diameter_d']:.4f}")
    print(f"  Pitch diameter (d₂):           {dimensions['external_pitch_diameter_d2']:.4f}")
    print(f"  Minor diameter (d₁):           {dimensions['external_minor_diameter_d1']:.4f}")
    print(f"  Core diameter (d₃):            {dimensions['external_core_diameter_d3']:.4f}")
    
    print("\n🔧 INTERNAL THREAD (NUT):")
    print(f"  Major diameter (D):            {dimensions['internal_major_diameter_D']:.4f}")
    print(f"  Pitch diameter (D₂):           {dimensions['internal_pitch_diameter_D2']:.4f}")
    print(f"  Minor diameter (D₁):           {dimensions['internal_minor_diameter_D1']:.4f}")
    
    print("\n📏 TOLERANCES (6H/6g STANDARD):")
    ext_tol = dimensions['external_tolerances']
    int_tol = dimensions['internal_tolerances']
    
    print("  External Thread (Bolt):")
    print(f"    d:  {ext_tol['d_max']:.4f}")
    print(f"    d₂: {ext_tol['d2_max']:.4f}")
    print(f"    d₁: {ext_tol['d1_max']:.4f}")
    
    print("  Internal Thread (Nut):")
    print(f"    D:  {int_tol['D_max']:.4f}")
    print(f"    D₂: {int_tol['D2_max']:.4f}")
    print(f"    D₁: {int_tol['D1_max']:.4f}")

def print_visual_reference():
    """Print visual reference diagrams showing where each dimension is located"""
    
    print("\n" + "=" * 60)
    print("📋 VISUAL REFERENCE - BOLT & NUT DIMENSIONS")
    print("=" * 60)
    
    print("\n🔩 EXTERNAL THREAD (BOLT) - Side View:")
    print("""
    ←─────── d (Major diameter) ────────→
         ↑                        ↑
         │    /\      /\      /\   │
         │   /  \    /  \    /  \  │
    ←─── d₂ ─→ \  /  \  /  \  / ←─ d₂ (Pitch diameter)
         │      \/    \/    \/     │
         │                         │
    ←─── d₁ ───────────────────── d₁ (Minor diameter)
         │                         │
    ←─── d₃ ───────────────────── d₃ (Core diameter)
         ↓                        ↓
    
    Thread Profile Detail:
         ←─── Pitch ────→
              ┌─────┐
          H → │ /\  │ ← H (Basic triangle height)
              │/  \ │
          h → │\  / │ ← h (Thread height 5/8 * H)
              │ \/  │
             h₃ ↑   ← h₃ (Thread height 1/8 * H)
    """)
    
    print("\n🔧 INTERNAL THREAD (NUT) - Cross Section:")
    print("""
    ←─────── D (Major diameter) ────────→
         ↑                        ↑
         │                         │
    ←─── D₁ ───────────────────── D₁ (Minor diameter - drilled hole)
         │      /\    /\    /\     │
         │     /  \  /  \  /  \    │
    ←─── D₂ ─→ \  /  \  /  \  / ←─ D₂ (Pitch diameter)
         │      \/    \/    \/     │
         ↓                        ↓
    
    Note: Internal threads are cut INTO the material
    - D₁ is the drilled hole diameter (larger than bolt's d₁)
    - D₂ is where bolt and nut threads engage
    - D is the outer diameter of the nut material
    """)
    
    print("\n📐 FUNDAMENTAL TRIANGLE ENGAGEMENT:")
    print("""
    Bolt Thread    Nut Thread
         /\           /\\
        /  \         /  \\
       /    \       /    \\
      /______\     /______\\
           ↑           ↑
      Thread       Thread
     Engagement   Engagement
         ↕             ↕
       0.75 * H     0.75 * H
    
    Where threads mesh together at pitch diameter (d₂/D₂)
    """)

if __name__ == "__main__":
    # Example calculations - modify these values as needed
    
    # M10 x 1.5 (coarse thread)
    nominal_diameter = 10  # mm
    pitch = 1           # mm
    
    # Calculate all dimensions
    dimensions = calculate_metric_thread_dimensions(nominal_diameter, pitch)
    
    # Print comprehensive report
    print_metric_thread_report(dimensions)
    
    # Print visual reference
    print_visual_reference()