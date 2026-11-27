import sys; sys.path.insert(0,'/tmp/w843p/k')
import ogen
D='/tmp/w843p/f_woc'; J='2427016876'
jobs=[('woc_forsaken','^Forsaken$','2287AC21'),('woc_lord_steed','^Chaos Lord on Chaos Steed$','6471BAB3'),('woc_sorc_lord','^Sorcerer Lord$','5EB3FC40'),('woc_ex_sorc','^Exalted Sorcerer$','3BE19799'),('woc_dprince','^Daemon Prince$','AE70EF08'),('woc_lord_manticore','^Chaos Lord on Manticore$','53040415')]
for uid,pat,sig in jobs:
    try: ogen.apply(J,pat,sig,uid,'woc',D,xp_cap=2600,xh_exact=60000)
    except Exception as e:
        import traceback; traceback.print_exc(); print('FAIL',uid)
