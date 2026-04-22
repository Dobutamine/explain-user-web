"""Explain — Python port of the neonatology simulation engine.

Spike scope: BaseModelClass, Capacitance, Resistor, a minimal Engine runner,
and a class registry. Enough to run a two-compartment toy scenario end-to-end
and prove out the architecture before porting the remaining models.
"""

from .engine import Engine
from .model_index import MODEL_INDEX

__all__ = ["Engine", "MODEL_INDEX"]
