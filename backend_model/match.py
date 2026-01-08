import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


#confidence Mapping:-

def confidence_from_cosine(sim,low=0.4,high=0.8):
    if sim <= low:
        return 0.0
    if sim >= high:
        return 100.0
    return ((sim-low)/(high-low))*100            #maps the sim in percent in the range of 0.4 to 0.8
 



