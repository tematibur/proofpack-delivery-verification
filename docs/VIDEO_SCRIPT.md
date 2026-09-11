# Video walkthrough script (target: 2:30-2:50)

A generated 1:25 backup walkthrough is included at `public/proofpack-walkthrough.mp4`. It uses live browser QA frames, local macOS text-to-speech and FFmpeg. The script below is still recommended for a candidate-recorded version because the role evaluates personal reasoning.

## 0:00-0:20 - Problem and boundary

"Proofpack compares a one-page packing list with up to three delivery photos. The key product decision is conservative evidence: a missing camera view never becomes a missing-item claim."

## 0:20-0:45 - Reproducible setup

Show `sample-data/packing-list.pdf`, the printed labels and the physical delivery.

"Each object keeps a unique UNIT ID across all photos. This is how the app avoids counting the same object twice. Expected results were recorded before testing."

## 0:45-1:15 - Run the initial delivery

Upload the PDF and three initial photos, then click **Run verification**.

"The app sends the original sources to an image-capable model. Users never retype the packing list."

## 1:15-1:55 - Findings and evidence

Open the correct mug, wrong towel, extra soap and obscured candle rows.

"Every conclusion references the PDF row and a bounding box on a photo. The towel has a visibly different but similar SKU. Three distinct soap UNIT IDs support the extra-unit finding. The candle remains unverified because its SKU is obscured, and the app asks for another photo."

## 1:55-2:15 - Correction

Run or show the corrected-delivery result.

"After replacing the towel, removing the extra soap and uncovering the candle label, all four rows can be confirmed."

## 2:15-2:40 - Measurement and limitations

Show the footer and delivery notes.

"This run took [TIME] seconds and cost an estimated [COST], calculated from measured tokens. The main limitation is approximate model bounding boxes. The next improvement would validate label visibility before inference."

## 2:40-2:50 - Close

"The repository includes setup instructions, the original test inputs, pre-recorded expectations, actual results and the validation tests."
