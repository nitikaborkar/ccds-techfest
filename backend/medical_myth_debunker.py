import random
import json
import os

class MedicalMythDebunker:
    def __init__(self):
        # Initialize with just one myth for reference
        self.myths = [
        {
            "myth": "Feed a cold, starve a fever.",
            "fact": "Both conditions actually need nutrition and hydration to recover! Your body isn't running some bizarre metabolic hostage negotiation where your cold gets the buffet while your fever sits in time-out with no snacks.",
            "source": "https://www.mayoclinic.org/diseases-conditions/common-cold/in-depth/cold-remedies/art-20046403"
        },
        {
            "myth": "You lose 50% of your body heat through your head.",
            "fact": "Your head loses heat at about the same rate as any uncovered body part. It's roughly 10% of heat loss, not 50%. Turns out your head isn't a biological chimney!",
            "source": "https://www.bmj.com/content/337/bmj.a2769"
        },
        {
            "myth": "Cracking your knuckles causes arthritis.",
            "fact": "The satisfying pop isn't your joints filing for early retirement. That sound is just gas bubbles in your joint fluid popping—annoying to others, perhaps, but not damaging your joints.",
            "source": "https://www.health.harvard.edu/blog/does-cracking-knuckles-cause-arthritis-2018051413797"
        },
        {
            "myth": "You need to drink 8 glasses of water daily.",
            "fact": "The '8x8 rule' is more marketing than medicine. Your water needs vary based on activity level, climate, and diet. Many foods contain water too! Your body is pretty good at telling you when it's thirsty.",
            "source": "https://jasn.asnjournals.org/content/19/6/1041"
        },
        {
            "myth": "Reading in dim light damages your eyes.",
            "fact": "Your eyes might feel strained, but they're not being permanently damaged by poor lighting. They're just working overtime, like an accountant during tax season—tired but not broken.",
            "source": "https://www.aao.org/eye-health/tips-prevention/digital-eye-strain"
        },
        {
            "myth": "You only use 10% of your brain.",
            "fact": "If this were true, brain injuries would be 90% less concerning! We actually use all parts of our brain, just not all simultaneously. It's like claiming you only use 10% of your house because you're not in every room at once.",
            "source": "https://www.scientificamerican.com/article/do-people-only-use-10-percent-of-their-brains/"
        },
        {
            "myth": "Swallowed gum stays in your stomach for 7 years.",
            "fact": "Gum doesn't set up a long-term residence in your digestive tract. While it's true your body can't digest it completely, it still moves through your system within a few days like other indigestible items.",
            "source": "https://health.clevelandclinic.org/swallowing-gum-dangerous/"
        },
        {
            "myth": "Wait an hour after eating before swimming.",
            "fact": "The idea that blood diverted to digestion will cause cramps leading to drowning doesn't hold water. While swimming on a very full stomach might be uncomfortable, it won't increase your drowning risk.",
            "source": "https://www.redcross.org/take-a-class/swimming/swim-safety/water-safety-for-parents"
        },
        {
            "myth": "Shaving makes hair grow back thicker.",
            "fact": "Hair doesn't respond to shaving by plotting revenge in the form of thicker regrowth. Cut hair has a blunt edge instead of a natural taper, making it feel coarser, but it's not actually thicker.",
            "source": "https://www.mayoclinic.org/healthy-lifestyle/adult-health/expert-answers/hair-removal/faq-20058427"
        },
        {
            "myth": "We have five distinct taste zones on our tongue.",
            "fact": "That tongue map showing sweet at the tip and bitter at the back? Pure fiction. All taste buds can detect all flavors, though with varying sensitivity. Your tongue isn't organized like a flavor filing system.",
            "source": "https://www.nature.com/articles/nature05401"
        },
        {
            "myth": "Eating turkey makes you sleepy because of tryptophan.",
            "fact": "Turkey contains tryptophan, but so do many proteins like chicken and beef. Your post-Thanksgiving food coma is more likely due to carb overload and that second helping of everything.",
            "source": "https://www.sleepfoundation.org/nutrition/does-turkey-make-you-sleepy"
        },
        {
            "myth": "You need to poop every day to be healthy.",
            "fact": "The 'normal' range is actually three times a day to three times a week. Your digestive tract doesn't operate on a strict 24-hour schedule like a train station.",
            "source": "https://health.clevelandclinic.org/how-often-should-you-poop/"
        },
        {
            "myth": "Sugar makes kids hyperactive.",
            "fact": "Studies repeatedly show no link between sugar and hyperactivity. The perception comes from the exciting contexts where sugar is often consumed (parties, holidays). It's the event making kids wild, not the cupcakes.",
            "source": "https://jamanetwork.com/journals/jama/article-abstract/391812"
        },
        {
            "myth": "Cold weather causes colds.",
            "fact": "Viruses cause colds, not temperature. Cold weather drives people indoors where viruses spread more easily. The weather isn't plotting against your immune system.",
            "source": "https://www.nih.gov/news-events/nih-research-matters/cold-flu-or-allergy"
        },
        {
            "myth": "Vaccines cause autism.",
            "fact": "This dangerous myth originated from a single, now thoroughly debunked and retracted study. Extensive research has found no connection whatsoever. Vaccines prevent disease; they don't cause developmental conditions.",
            "source": "https://www.cdc.gov/vaccinesafety/concerns/autism.html"
        },
        {
            "myth": "We should detox our bodies regularly.",
            "fact": "Unless you're in rehab or have liver/kidney disease, your body detoxifies itself constantly without trendy juices or foot pads. Your liver and kidneys are working 24/7 cleanup crews.",
            "source": "https://www.health.harvard.edu/staying-healthy/the-dubious-practice-of-detox"
        },
        {
            "myth": "Antibiotics help with the common cold or flu.",
            "fact": "Antibiotics fight bacteria, not viruses. Using them for viral infections is like trying to fix your computer by washing your car. They won't help, and misuse contributes to antibiotic resistance.",
            "source": "https://www.who.int/news-room/fact-sheets/detail/antibiotic-resistance"
        },
        {
            "myth": "Waking a sleepwalker is dangerous.",
            "fact": "Waking a sleepwalker won't cause heart attacks or shock. It might confuse or disorient them briefly, but that's better than letting them wander into traffic.",
            "source": "https://www.sleepfoundation.org/parasomnias/sleepwalking"
        },
        {
            "myth": "Your heart stops when you sneeze.",
            "fact": "Your heart doesn't take dramatic pause during a sneeze. Your blood pressure changes slightly, and you might feel a funny sensation in your chest, but your heart keeps beating.",
            "source": "https://health.clevelandclinic.org/does-your-heart-stop-when-you-sneeze/"
        },
        {
            "myth": "Coffee stunts your growth.",
            "fact": "Coffee doesn't prevent children from reaching their full height potential. Genetics plays the starring role in growth, with nutrition as the supporting actor.",
            "source": "https://www.hopkinsmedicine.org/health/wellness-and-prevention/9-reasons-why-the-right-amount-of-coffee-is-good-for-you"
        },
        {
            "myth": "Going outside with wet hair causes illness.",
            "fact": "Your wet hair in cold weather might make you uncomfortable, but it won't make you sick. Viruses cause illness, not damp hair.",
            "source": "https://health.clevelandclinic.org/can-you-get-sick-from-being-cold/"
        },
        {
            "myth": "We need to drink milk for strong bones.",
            "fact": "While milk contains calcium, it's not the only source. Many cultures have minimal dairy consumption and don't suffer epidemic bone problems. Leafy greens, beans, and fortified foods can provide calcium too.",
            "source": "https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/calcium-and-milk/"
        },
        {
            "myth": "You can target fat loss to specific body areas.",
            "fact": "Spot reduction is the fitness equivalent of unicorns—widely discussed but not actually real. When you lose fat, your body decides where from based on genetics and hormones.",
            "source": "https://www.yalescientific.org/2011/04/targeted-fat-loss-myth-or-reality/"
        },
        {
            "myth": "Humans have five senses.",
            "fact": "We have way more than five! Beyond sight, smell, taste, touch, and hearing, we have proprioception (body position awareness), equilibrioception (balance), thermoception (temperature), nociception (pain), and more.",
            "source": "https://www.scientificamerican.com/article/how-many-senses-does-the-human-body-have/"
        },
        {
            "myth": "Eating carrots improves your night vision.",
            "fact": "This myth began as British WWII propaganda to hide radar technology advancements. While vitamin A in carrots is important for eye health, eating a carrot farm won't give you superhero night vision.",
            "source": "https://www.bmj.com/content/331/7531/1471.1"
        },
        {
            "myth": "Ulcers are caused by stress and spicy foods.",
            "fact": "Most ulcers are caused by H. pylori bacteria or long-term NSAID use, not your stressful job or love of hot sauce. Your stomach lining isn't keeping score of how many jalapeños you've eaten.",
            "source": "https://www.niddk.nih.gov/health-information/digestive-diseases/peptic-ulcers-stomach-ulcers"
        },
        {
            "myth": "Hair and fingernails continue growing after death.",
            "fact": "This creepy claim is just an optical illusion. Skin dehydrates and retracts after death, making hair and nails appear longer. Your body doesn't continue its beauty regimen after you've shuffled off this mortal coil.",
            "source": "https://www.sciencedirect.com/science/article/abs/pii/S0379073818301129"
        }
]

        
        # Load myths from file if it exists
        self.filename = "medical_myths.json"
        self.load_myths()
        
    def load_myths(self):
        """Load myths from JSON file if it exists"""
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    loaded_myths = json.load(f)
                    # Only update if it's a valid list
                    if isinstance(loaded_myths, list) and loaded_myths:
                        self.myths = loaded_myths
                        print(f"Loaded {len(self.myths)} myths from {self.filename}")
            except json.JSONDecodeError:
                print(f"Error loading {self.filename}, using default myths")
    
    def get_random_myth(self):
        """Return a random myth from the collection"""
        if not self.myths:
            return "No myths available."
        
        random_myth = random.choice(self.myths)
        return f"\nMYTH: {random_myth['myth']}\n\nFACT: {random_myth['fact']}\n\nSOURCE: {random_myth['source']}\n"

